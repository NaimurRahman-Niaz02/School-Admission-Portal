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

  async findDuplicateClass(grade, shift, group, session) {
    if (!useMockApi) {
      const classes = await this.getClasses();
      const targetGrade = (grade || '').trim();
      const targetShift = (shift || '').trim();
      const targetGroup = (group || 'General').trim();
      return classes.find((c) => {
        const cGrade = c.grade || '';
        const cShift = c.shift || (/day/i.test(c.name) ? 'Day' : 'Morning');
        const cGroup = c.group || 'General';
        return (
          cGrade.toLowerCase() === targetGrade.toLowerCase() &&
          cShift.toLowerCase() === targetShift.toLowerCase() &&
          cGroup.toLowerCase() === targetGroup.toLowerCase()
        );
      });
    }

    return storageService.findDuplicateClass(grade, shift, group, session);
  },

  async createClass({
    grade,
    shift,
    group,
    session = 'Session 27',
    totalSeats,
    name,
    fee,
    admissionStartDate,
    admissionEndDate,
  }) {
    let targetGrade = (grade || '').trim();
    let targetShift = (shift || 'Morning').trim();
    let targetGroup = (group || '').trim();
    let targetSession = (session || 'Session 27').trim();

    if (targetSession === '2027' || targetSession === 'Session 2027') {
      targetSession = 'Session 27';
    }

    if (!targetGrade && name) {
      const cleanName = name.trim();
      const m = cleanName.match(/Class\s*(\d+)/i);
      targetGrade = m ? `Class ${m[1]}` : 'Class 6';
      if (/morning/i.test(cleanName)) targetShift = 'Morning';
      else if (/day/i.test(cleanName)) targetShift = 'Day';
      if (/science/i.test(cleanName)) targetGroup = 'Science';
      else if (/commerce/i.test(cleanName)) targetGroup = 'Commerce';
      else if (/arts/i.test(cleanName)) targetGroup = 'Arts';
      else targetGroup = 'General';
    }

    const VALID_GRADES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    if (!VALID_GRADES.includes(targetGrade)) {
      throw new ApiError(
        `Invalid grade selected: "${targetGrade}". Must be Class 6 through Class 10.`,
        400
      );
    }

    const VALID_SHIFTS = ['Morning', 'Day'];
    if (!VALID_SHIFTS.includes(targetShift)) {
      throw new ApiError(`Invalid shift selected: "${targetShift}". Must be Morning or Day.`, 400);
    }

    const isHigherGrade = targetGrade === 'Class 9' || targetGrade === 'Class 10';
    if (isHigherGrade) {
      const VALID_GROUPS = ['Science', 'Commerce', 'Arts'];
      if (!VALID_GROUPS.includes(targetGroup)) {
        throw new ApiError(`${targetGrade} requires a discipline group: Science, Commerce, or Arts.`, 400);
      }
    } else {
      targetGroup = 'General';
    }

    const seats = parseInt(totalSeats, 10);
    if (isNaN(seats) || seats <= 0) {
      throw new ApiError('Total seats must be a positive integer greater than 0.', 400);
    }
    if (seats > 500) {
      throw new ApiError('Total seats cannot exceed 500 per class.', 400);
    }

    let cleanFee = parseInt(fee, 10);
    if (isNaN(cleanFee) || cleanFee <= 0) {
      cleanFee = isHigherGrade ? 1800 : 1500;
    }

    const canonicalName = isHigherGrade
      ? `${targetGrade} - ${targetGroup} (${targetShift})`
      : `${targetGrade} - ${targetShift}`;

    // Check duplicate
    const duplicate = await this.findDuplicateClass(
      targetGrade,
      targetShift,
      targetGroup,
      targetSession
    );
    if (duplicate) {
      throw new ApiError(
        `This class already exists: "${canonicalName}" is already created for ${targetSession}. You cannot create duplicate classes.`,
        409
      );
    }

    if (!useMockApi) {
      // Official API accepts strictly { "name": "...", "totalSeats": 120 }
      const data = await request('/classes', {
        method: 'POST',
        body: JSON.stringify({
          name: canonicalName,
          totalSeats: seats,
        }),
      });

      return {
        id: data.id || generateId('class'),
        name: canonicalName,
        grade: targetGrade,
        shift: targetShift,
        group: targetGroup,
        session: targetSession,
        totalSeats: seats,
        heldSeats: 0,
        confirmedSeats: 0,
        availableSeats: seats,
        status: 'Available',
        fee: cleanFee,
        admissionStartDate: admissionStartDate || new Date().toISOString(),
        admissionEndDate:
          admissionEndDate || new Date(Date.now() + 30 * 86400000).toISOString(),
      };
    }

    await delay(200);

    const newClass = {
      id: generateId('class'),
      name: canonicalName,
      grade: targetGrade,
      shift: targetShift,
      group: targetGroup,
      session: targetSession,
      totalSeats: seats,
      fee: cleanFee,
      admissionStartDate:
        admissionStartDate || new Date().toISOString(),
      admissionEndDate:
        admissionEndDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    };

    storageService.addClass(newClass);
    return storageService.getClassSeatStats(newClass.id);
  },

  async getAuthoritySummary() {
    if (!useMockApi) {
      const classes = await this.getClasses();
      const totalClasses = classes.length;
      let totalCapacity = 0;
      let totalHeld = 0;
      let totalConfirmed = 0;
      let totalAvailable = 0;

      for (const c of classes) {
        totalCapacity += Number(c.totalSeats) || 0;
        totalHeld += Number(c.heldSeats) || 0;
        totalConfirmed += Number(c.confirmedSeats) || 0;
        totalAvailable += Number(c.availableSeats) || 0;
      }

      const occupancyRate =
        totalCapacity > 0
          ? Math.round(((totalHeld + totalConfirmed) / totalCapacity) * 100)
          : 0;

      return {
        totalClasses,
        totalCapacity,
        totalHeld,
        totalConfirmed,
        totalAvailable,
        occupancyRate,
        classes,
      };
    }

    await delay(120);
    storageService.expireHolds();

    const classes = storageService.getAllClassesWithStats();
    const totalClasses = classes.length;
    let totalCapacity = 0;
    let totalHeld = 0;
    let totalConfirmed = 0;
    let totalAvailable = 0;

    for (const c of classes) {
      totalCapacity += c.totalSeats;
      totalHeld += c.heldSeats;
      totalConfirmed += c.confirmedSeats;
      totalAvailable += c.availableSeats;
    }

    const occupancyRate =
      totalCapacity > 0
        ? Math.round(((totalHeld + totalConfirmed) / totalCapacity) * 100)
        : 0;

    return {
      totalClasses,
      totalCapacity,
      totalHeld,
      totalConfirmed,
      totalAvailable,
      occupancyRate,
      classes,
    };
  },

  async getClassRoster(classId) {
    if (!useMockApi) {
      const classInfo = await this.getClassById(classId);
      // In real mode, assessment API doesn't provide student roster endpoint
      return {
        classInfo,
        admitted: [],
        reserved: [],
        history: [],
        totalAdmitted: classInfo.confirmedSeats || 0,
        totalReserved: classInfo.heldSeats || 0,
        totalHistorical: 0,
        isRosterAvailable: false,
      };
    }

    await delay(150);
    storageService.expireHolds();

    const classInfo = storageService.getClassSeatStats(classId);
    if (!classInfo) {
      throw new ApiError('Class not found', 404);
    }

    const allHolds = storageService.getHolds().filter((h) => h.classId === classId);

    const admitted = allHolds
      .filter((h) => h.status === 'CONFIRMED')
      .sort(
        (a, b) =>
          new Date(b.confirmedAt || b.createdAt) -
          new Date(a.confirmedAt || a.createdAt)
      );

    const now = Date.now();
    const reserved = allHolds
      .filter((h) => h.status === 'HELD' && new Date(h.expiresAt).getTime() > now)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((h) => ({
        ...h,
        remainingSeconds: Math.max(
          0,
          Math.floor((new Date(h.expiresAt).getTime() - now) / 1000)
        ),
      }));

    const history = allHolds
      .filter((h) => h.status === 'EXPIRED' || h.status === 'CANCELLED')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      classInfo,
      admitted,
      reserved,
      history,
      totalAdmitted: admitted.length,
      totalReserved: reserved.length,
      totalHistorical: history.length,
      isRosterAvailable: true,
    };
  },

  async getStudentAdmissionDetail(holdId) {
    if (!useMockApi) {
      const hold = await this.getHoldById(holdId);
      return hold;
    }

    await delay(100);
    storageService.expireHolds();

    const hold = storageService.getHoldById(holdId);
    if (!hold) {
      throw new ApiError('Student admission record not found.', 404);
    }

    const classInfo = storageService.getClassSeatStats(hold.classId);
    const now = Date.now();
    const expTime = new Date(hold.expiresAt).getTime();
    const remainingSeconds = Math.max(0, Math.floor((expTime - now) / 1000));

    return {
      ...hold,
      classInfo,
      grade: classInfo ? classInfo.grade : 'Class',
      shift: classInfo ? classInfo.shift : 'Morning',
      group: classInfo ? classInfo.group : 'General',
      session: classInfo ? classInfo.session : 'Session 27',
      remainingSeconds,
      isExpired:
        hold.status === 'EXPIRED' || (hold.status === 'HELD' && expTime <= now),
    };
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
