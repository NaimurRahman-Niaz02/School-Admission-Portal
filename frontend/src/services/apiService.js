/**
 * apiService.js - Simulated Backend API Service with Validation and Latency
 * Hashmat Uddin High School Online Admission System
 */

import { storageService } from './storageService';
import {
  isValid17DigitId,
  getHoldDurationSeconds,
  generateId,
  generateApplicationCode,
} from '../utils/formatters';

export class ApiError extends Error {
  constructor(message, status = 400, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  ApiError,

  async verifyAdminPassword(password) {
    await delay(180);
    const cleanPass = (password || '').trim();
    const VALID_PASSWORDS = ['admin2026', 'admin123', 'greenwood2026'];

    if (!cleanPass) {
      throw new ApiError('Please enter the authority passcode.', 400);
    }

    if (VALID_PASSWORDS.includes(cleanPass)) {
      storageService.setAdminAuthenticated(true);
      return { ok: true, message: 'Authentication verified successfully.' };
    }

    throw new ApiError('Incorrect authority passcode. Please check and try again.', 401);
  },

  async logoutAdmin() {
    await delay(80);
    storageService.setAdminAuthenticated(false);
    return { ok: true };
  },

  async getAdmissionTimeline() {
    await delay(40);
    return storageService.getTimeline();
  },

  async updateAdmissionTimeline({ startDate, endDate }) {
    await delay(100);
    const timeline = storageService.saveTimeline({ startDate, endDate });
    return { ok: true, timeline };
  },

  async getClasses() {
    await delay(100);
    storageService.expireHolds();
    return storageService.getAllClassesWithStats();
  },

  async getClassById(classId) {
    await delay(80);
    storageService.expireHolds();
    const cls = storageService.getClassSeatStats(classId);
    if (!cls) {
      throw new ApiError('Class not found', 404);
    }
    return cls;
  },

  async getStudentAdmissionSummary(studentId) {
    await delay(80);
    storageService.expireHolds();

    if (!studentId || !isValid17DigitId(studentId)) {
      return {
        studentId: null,
        admissionState: 'NONE',
        currentApplication: null,
        canApply: true,
        reason: null,
      };
    }

    const cleanId = String(studentId).trim();
    const holds = storageService.getHoldsByStudent(cleanId);

    // Check for CONFIRMED
    const confirmedHold = holds.find((h) => h.status === 'CONFIRMED');
    if (confirmedHold) {
      const cls = storageService.getClassById(confirmedHold.classId);
      return {
        studentId: cleanId,
        admissionState: 'CONFIRMED',
        currentApplication: {
          ...confirmedHold,
          className: cls ? cls.name : 'Unknown Class',
        },
        canApply: false,
        reason: `Your admission has already been confirmed for ${cls ? cls.name : 'a class'}. Multiple admissions are not permitted.`,
      };
    }

    // Check for active unexpired HELD
    const now = Date.now();
    const activeHold = holds.find((h) => {
      return h.status === 'HELD' && new Date(h.expiresAt).getTime() > now;
    });

    if (activeHold) {
      const cls = storageService.getClassById(activeHold.classId);
      const remainingSeconds = Math.max(0, Math.floor((new Date(activeHold.expiresAt).getTime() - now) / 1000));
      return {
        studentId: cleanId,
        admissionState: 'HELD',
        currentApplication: {
          ...activeHold,
          className: cls ? cls.name : 'Unknown Class',
          remainingSeconds,
        },
        canApply: false,
        reason: `You already have an active seat reservation in ${cls ? cls.name : 'a class'}. You must cancel it before selecting another class.`,
      };
    }

    return {
      studentId: cleanId,
      admissionState: 'NONE',
      currentApplication: null,
      canApply: true,
      reason: null,
    };
  },

  async createHold(classId, studentId) {
    await delay(200);
    storageService.expireHolds();

    const cleanId = (studentId || '').trim();
    if (!isValid17DigitId(cleanId)) {
      throw new ApiError('A valid 17-digit birth registration number is required.', 400);
    }

    const classStats = storageService.getClassSeatStats(classId);
    if (!classStats) {
      throw new ApiError('The selected class does not exist.', 404);
    }

    const summary = await this.getStudentAdmissionSummary(cleanId);
    if (!summary.canApply) {
      if (summary.admissionState === 'CONFIRMED') {
        throw new ApiError(
          `Admission already confirmed: You have confirmed admission in "${summary.currentApplication.className}". You cannot apply to another class.`,
          409,
          { admissionState: 'CONFIRMED', currentApplication: summary.currentApplication }
        );
      }
      if (summary.admissionState === 'HELD') {
        throw new ApiError(
          `Active reservation exists: You already have an active seat hold in "${summary.currentApplication.className}". Cancel the active reservation before selecting another class.`,
          409,
          { admissionState: 'HELD', currentApplication: summary.currentApplication }
        );
      }
    }

    if (classStats.availableSeats <= 0) {
      throw new ApiError(
        `No seats available: "${classStats.name}" is currently full. Please check back later or choose another class.`,
        400
      );
    }

    const durationSeconds = getHoldDurationSeconds();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationSeconds * 1000);

    const hold = {
      holdId: generateId('hold'),
      applicationCode: generateApplicationCode(),
      classId,
      studentId: cleanId,
      status: 'HELD',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      confirmedAt: null,
    };

    storageService.addHold(hold);

    return {
      hold,
      classInfo: storageService.getClassSeatStats(classId),
      remainingSeconds: durationSeconds,
    };
  },

  async confirmPayment(holdId) {
    await delay(250);
    storageService.expireHolds();

    const hold = storageService.getHoldById(holdId);
    if (!hold) {
      throw new ApiError('Reservation record not found.', 404);
    }

    if (hold.status === 'EXPIRED') {
      throw new ApiError('This reservation has expired. The seat has been returned to the available pool.', 410);
    }

    if (hold.status === 'CANCELLED') {
      throw new ApiError('This reservation was cancelled and cannot be paid for.', 400);
    }

    if (hold.status === 'CONFIRMED') {
      return { ok: true, hold, alreadyConfirmed: true };
    }

    const now = Date.now();
    if (new Date(hold.expiresAt).getTime() <= now) {
      storageService.updateHold(holdId, { status: 'EXPIRED', expiredAt: new Date().toISOString() });
      throw new ApiError('Your 10-minute hold elapsed just now. The seat has been released.', 410);
    }

    const updated = storageService.updateHold(holdId, {
      status: 'CONFIRMED',
      confirmedAt: new Date().toISOString(),
    });

    return {
      ok: true,
      hold: updated,
      classInfo: storageService.getClassSeatStats(hold.classId),
    };
  },

  async cancelHold(holdId) {
    await delay(120);
    const hold = storageService.getHoldById(holdId);
    if (!hold) {
      throw new ApiError('Reservation record not found.', 404);
    }

    if (hold.status === 'CONFIRMED') {
      throw new ApiError('Cannot cancel a confirmed admission.', 400);
    }

    const updated = storageService.updateHold(holdId, {
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
    });

    return {
      ok: true,
      hold: updated,
      classInfo: storageService.getClassSeatStats(hold.classId),
    };
  },
};

export default apiService;
