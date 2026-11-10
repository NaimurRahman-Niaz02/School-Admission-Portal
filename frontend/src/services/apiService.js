/**
 * apiService.js - Simulated Backend API Service & Real API HTTP Client
 * Supports mock mode (localStorage) and real backend API via environment variables:
 * - VITE_API_BASE_URL (defaults to empty string or /api)
 * - VITE_USE_MOCK_API (defaults to true)
 *
 * Real API Endpoints:
 * - POST /classes
 * - GET /classes
 * - GET /classes/{classId}
 * - POST /classes/{classId}/holds
 * - GET /holds/{holdId}
 * - POST /holds/{holdId}/confirm
 * - DELETE /holds/{holdId}
 * - GET /me/holds (X-Student-Id header)
 */

import { storageService } from './storageService.js';
import {
  isValid17DigitId,
  getHoldDurationSeconds,
  generateId,
  generateApplicationCode,
} from '../utils/formatters.js';

export class ApiError extends Error {
  constructor(message, status = 400, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

// Config flag
const useMockApi =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env.VITE_USE_MOCK_API !== 'false'
    : true;
const apiBaseUrl = (
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : ''
).replace(/\/$/, '');

// Simulated network latency for mock mode
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Real API Fetch helper with X-Student-Id and JSON parsing
 */
async function request(endpoint, options = {}) {
  const url = `${apiBaseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const studentId = storageService.getSavedStudentId();
  if (studentId && !headers['X-Student-Id']) {
    headers['X-Student-Id'] = studentId;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    throw new ApiError(
      `Network error connecting to backend service: ${err.message}`,
      503
    );
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg =
      (data && (data.message || data.error)) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data;
}

export const apiService = {
  ApiError,
  isMockMode: useMockApi,

  // =========================================================================
  // Admission Schedule & Timeline
  // =========================================================================

  async getAdmissionTimeline() {
    if (!useMockApi) {
      try {
        return await request('/timeline');
      } catch {
        return storageService.getTimeline();
      }
    }
    await delay(40);
    return storageService.getTimeline();
  },

  async updateAdmissionTimeline({ startDate, endDate }) {
    if (!useMockApi) {
      try {
        const res = await request('/timeline', {
          method: 'PUT',
          body: JSON.stringify({ startDate, endDate }),
        });
        return { ok: true, timeline: res };
      } catch (e) {
        throw new ApiError(e.message || 'Failed to update timeline', e.status || 400);
      }
    }
    await delay(100);
    const timeline = storageService.saveTimeline({ startDate, endDate });
    return { ok: true, timeline };
  },

  // =========================================================================
  // Classes
  // =========================================================================

  async getClasses() {
    if (!useMockApi) {
      const data = await request('/classes');
      return (data || []).map((cls) => {
        const totalSeats = Number(cls.totalSeats) || 0;
        const heldSeats = Number(cls.heldSeats) || 0;
        const confirmedSeats = Number(cls.confirmedSeats) || 0;
        const availableSeats =
          cls.availableSeats !== undefined
            ? Number(cls.availableSeats)
            : Math.max(0, totalSeats - heldSeats - confirmedSeats);

        let status = 'Available';
        if (availableSeats <= 0) {
          status = 'Full';
        } else if (availableSeats <= Math.max(3, Math.ceil(totalSeats * 0.15))) {
          status = 'Limited Seats';
        }

        return {
          ...cls,
          totalSeats,
          heldSeats,
          confirmedSeats,
          availableSeats,
          status,
          occupancyRate:
            totalSeats > 0
              ? Math.round(((heldSeats + confirmedSeats) / totalSeats) * 100)
              : 0,
        };
      });
    }

    await delay(100);
    storageService.expireHolds();
    return storageService.getAllClassesWithStats();
  },

  async getClassById(classId) {
    if (!useMockApi) {
      const cls = await request(`/classes/${classId}`);
      if (!cls) {
        throw new ApiError('Class not found', 404);
      }
      const totalSeats = Number(cls.totalSeats) || 0;
      const heldSeats = Number(cls.heldSeats) || 0;
      const confirmedSeats = Number(cls.confirmedSeats) || 0;
      const availableSeats =
        cls.availableSeats !== undefined
          ? Number(cls.availableSeats)
          : Math.max(0, totalSeats - heldSeats - confirmedSeats);

      let status = 'Available';
      if (availableSeats <= 0) {
        status = 'Full';
      } else if (availableSeats <= Math.max(3, Math.ceil(totalSeats * 0.15))) {
        status = 'Limited Seats';
      }

      return {
        ...cls,
        totalSeats,
        heldSeats,
        confirmedSeats,
        availableSeats,
        status,
        occupancyRate:
          totalSeats > 0
            ? Math.round(((heldSeats + confirmedSeats) / totalSeats) * 100)
            : 0,
      };
    }

    await delay(80);
    storageService.expireHolds();
    const cls = storageService.getClassSeatStats(classId);
    if (!cls) {
      throw new ApiError('Class not found', 404);
    }
    return cls;
  },

  // =========================================================================
  // Holds / Reservations & Applications
  // =========================================================================

  async createHold(classId, studentId) {
    const cleanId = (studentId || '').trim();
    if (!isValid17DigitId(cleanId)) {
      throw new ApiError('A valid 17-digit birth registration number is required.', 400);
    }

    if (!useMockApi) {
      const data = await request(`/classes/${classId}/holds`, {
        method: 'POST',
        headers: {
          'X-Student-Id': cleanId,
        },
        body: JSON.stringify({ studentId: cleanId }),
      });
      return {
        hold: data.hold || data,
        classInfo: data.classInfo || null,
        remainingSeconds: data.remainingSeconds || 600,
      };
    }

    await delay(200);
    storageService.expireHolds();

    const classStats = storageService.getClassSeatStats(classId);
    if (!classStats) {
      throw new ApiError('The selected class does not exist.', 404);
    }

    // Enforce Global Single-Hold / Confirmed Rule
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
      className: classStats.name,
      studentId: cleanId,
      status: 'HELD',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      durationSeconds,
      confirmedAt: null,
      cancelledAt: null,
      expiredAt: null,
    };

    storageService.addHold(hold);

    return {
      ...hold,
      hold,
      classInfo: storageService.getClassSeatStats(classId),
      remainingSeconds: durationSeconds,
    };
  },

  async getHoldById(holdId) {
    if (!useMockApi) {
      const data = await request(`/holds/${holdId}`);
      if (!data) {
        throw new ApiError('Application reservation not found.', 404);
      }
      const now = Date.now();
      const expTime = new Date(data.expiresAt).getTime();
      const remainingSeconds = Math.max(0, Math.floor((expTime - now) / 1000));
      return {
        ...data,
        remainingSeconds,
      };
    }

    await delay(120);
    storageService.expireHolds();

    const hold = storageService.getHoldById(holdId);
    if (!hold) {
      throw new ApiError('Application reservation not found.', 404);
    }

    const classInfo = storageService.getClassSeatStats(hold.classId);
    const now = Date.now();
    const expTime = new Date(hold.expiresAt).getTime();
    const remainingSeconds = Math.max(0, Math.floor((expTime - now) / 1000));

    return {
      ...hold,
      className: classInfo ? classInfo.name : hold.className || 'Unknown Class',
      classInfo,
      remainingSeconds,
    };
  },

  async confirmHold(holdId, studentId) {
    const cleanId = (studentId || '').trim();

    if (!useMockApi) {
      const data = await request(`/holds/${holdId}/confirm`, {
        method: 'POST',
        headers: {
          'X-Student-Id': cleanId,
        },
        body: JSON.stringify({ studentId: cleanId }),
      });
      return data.hold || data;
    }

    await delay(250);
    storageService.expireHolds();

    const hold = storageService.getHoldById(holdId);
    if (!hold) {
      throw new ApiError('Application not found.', 404);
    }

    if (cleanId && String(hold.studentId).trim() !== cleanId) {
      throw new ApiError('This application does not match the active student identification.', 403);
    }

    if (hold.status === 'CONFIRMED') {
      const classInfo = storageService.getClassSeatStats(hold.classId);
      return {
        ...hold,
        classInfo,
        isAlreadyConfirmed: true,
      };
    }

    const now = Date.now();
    if (hold.status === 'EXPIRED' || new Date(hold.expiresAt).getTime() <= now) {
      if (hold.status !== 'EXPIRED') {
        storageService.updateHold(holdId, { status: 'EXPIRED', expiredAt: new Date().toISOString() });
      }
      throw new ApiError(
        'Reservation expired: The temporary hold period has ended and the seat has been released.',
        400
      );
    }

    if (hold.status === 'CANCELLED') {
      throw new ApiError('This reservation was cancelled and cannot be confirmed.', 400);
    }

    if (hold.status !== 'HELD') {
      throw new ApiError(`Invalid reservation status: ${hold.status}`, 400);
    }

    const confirmedAt = new Date().toISOString();
    const updated = storageService.updateHold(holdId, {
      status: 'CONFIRMED',
      confirmedAt,
    });

    const classInfo = storageService.getClassSeatStats(hold.classId);

    return {
      ...updated,
      classInfo,
    };
  },

  async cancelHold(holdId, studentId) {
    const cleanId = (studentId || '').trim();

    if (!useMockApi) {
      const data = await request(`/holds/${holdId}`, {
        method: 'DELETE',
        headers: {
          'X-Student-Id': cleanId,
        },
      });
      return data.hold || data;
    }

    await delay(180);
    storageService.expireHolds();

    const hold = storageService.getHoldById(holdId);
    if (!hold) {
      throw new ApiError('Application not found.', 404);
    }

    if (cleanId && String(hold.studentId).trim() !== cleanId) {
      throw new ApiError('This application does not match the active student identification.', 403);
    }

    if (hold.status === 'CONFIRMED') {
      throw new ApiError('Cannot cancel an admission that has already been confirmed.', 400);
    }

    if (hold.status === 'CANCELLED') {
      return hold;
    }

    if (hold.status === 'EXPIRED') {
      throw new ApiError('Reservation has already expired.', 400);
    }

    if (hold.status !== 'HELD') {
      throw new ApiError(`Cannot cancel application in "${hold.status}" state.`, 400);
    }

    const cancelledAt = new Date().toISOString();
    const updated = storageService.updateHold(holdId, {
      status: 'CANCELLED',
      cancelledAt,
    });

    const classInfo = storageService.getClassSeatStats(hold.classId);

    return {
      ...updated,
      classInfo,
    };
  },

  async getStudentHolds(studentId) {
    if (!studentId || !isValid17DigitId(studentId)) return [];
    const cleanId = String(studentId).trim();

    if (!useMockApi) {
      const data = await request('/me/holds', {
        headers: {
          'X-Student-Id': cleanId,
        },
      });
      return data || [];
    }

    await delay(120);
    storageService.expireHolds();

    const holds = storageService.getHoldsByStudent(cleanId);
    const classes = storageService.getClasses();
    const classMap = new Map(classes.map((c) => [c.id, c]));

    return holds.map((h) => {
      const cls = classMap.get(h.classId);
      return {
        ...h,
        className: cls ? cls.name : h.className || 'Unknown Class',
      };
    });
  },

  // =========================================================================
  // Global Student Admission Summary & Single-Hold Rules
  // =========================================================================

  async getStudentAdmissionSummary(studentId) {
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
    const holds = await this.getStudentHolds(cleanId);

    // Rule 1: Check for confirmed admission (permanent block)
    const confirmedHold = holds.find((h) => h.status === 'CONFIRMED');
    if (confirmedHold) {
      return {
        studentId: cleanId,
        admissionState: 'CONFIRMED',
        currentApplication: confirmedHold,
        canApply: false,
        reason: `Your admission has already been confirmed for ${confirmedHold.className || 'a class'}. Multiple admissions are not permitted.`,
      };
    }

    // Rule 2: Check for active hold (temporary block until cancelled or expired)
    const now = Date.now();
    const activeHold = holds.find(
      (h) => h.status === 'HELD' && new Date(h.expiresAt).getTime() > now
    );

    if (activeHold) {
      const remainingSeconds = Math.max(
        0,
        Math.floor((new Date(activeHold.expiresAt).getTime() - now) / 1000)
      );
      return {
        studentId: cleanId,
        admissionState: 'HELD',
        currentApplication: {
          ...activeHold,
          remainingSeconds,
        },
        canApply: false,
        reason: `You already have an active seat reservation in ${activeHold.className || 'a class'}. You must cancel it before selecting another class.`,
      };
    }

    // Student has no active or confirmed holds (expired or cancelled do not block)
    return {
      studentId: cleanId,
      admissionState: 'NONE',
      currentApplication: null,
      canApply: true,
      reason: null,
    };
  },

  // =========================================================================
  // Admin Authentication
  // =========================================================================

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
};

export default apiService;
