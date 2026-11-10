/**
 * mockApi.js - Simulated Backend Service with Business Logic and Realistic Network Delays
 * Hashmat Uddin High School Admission Portal
 */

(function (window) {
  'use strict';

  class ApiError extends Error {
    constructor(message, status = 400, details = null) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.details = details;
    }
  }

  // Simulated network latency
  const delay = (ms = 180) => new Promise(resolve => setTimeout(resolve, ms));

  const MockApi = {
    ApiError,

    /**
     * Admin Authentication Verification
     * Accepts 'admin2026' or 'admin123'
     */
    async verifyAdminPassword(password) {
      await delay(200);
      const cleanPass = (password || '').trim();
      const VALID_PASSWORDS = ['admin2026', 'admin123', 'greenwood2026'];

      if (!cleanPass) {
        throw new ApiError('Please enter the authority passcode.', 400);
      }

      if (VALID_PASSWORDS.includes(cleanPass)) {
        Store.setAdminAuthenticated(true);
        return { ok: true, message: 'Authentication verified successfully.' };
      }

      throw new ApiError('Incorrect authority passcode. Please check and try again.', 401);
    },

    /**
     * Sign out admin
     */
    async logoutAdmin() {
      await delay(100);
      Store.setAdminAuthenticated(false);
      return { ok: true };
    },

    /**
     * Get admission timeline schedule (Session 2027)
     */
    async getAdmissionTimeline() {
      await delay(50);
      return Store.getTimeline();
    },

    /**
     * Update admission timeline schedule (Session 2027)
     */
    async updateAdmissionTimeline({ startDate, endDate }) {
      await delay(100);
      const timeline = Store.saveTimeline({ startDate, endDate });
      return { ok: true, timeline };
    },

    /**
     * Get all admission classes with dynamic seat statistics
     */
    async getClasses() {
      await delay(150);
      Store.expireHolds();
      return Store.getAllClassesWithStats();
    },

    /**
     * Get a single class by ID with dynamic seat statistics
     */
    async getClassById(classId) {
      await delay(120);
      Store.expireHolds();
      const cls = Store.getClassSeatStats(classId);
      if (!cls) {
        throw new ApiError('Class not found', 404);
      }
      return cls;
    },

    /**
     * Create a new admission class (Authority Portal)
     * Rules:
     * - Grades: Class 6, Class 7, Class 8, Class 9, Class 10
     * - Shifts: Morning, Day
     * - Class 9 & 10 have three groups: Science, Arts, Commerce
     * - Session: Session 27 (Session 2026-2027) or next sessions
     * - Unique Constraint: Admin cannot create two classes for same class & shift in same session (e.g. Class 8 Morning can have at most one class)
     */
    async createClass({ grade, shift, group, session, totalSeats, name, fee, admissionStartDate, admissionEndDate }) {
      await delay(220);

      // Support either structured parameters or legacy name string
      let targetGrade = (grade || '').trim();
      let targetShift = (shift || '').trim();
      let targetGroup = (group || '').trim();
      let targetSession = (session || 'Session 27').trim();

      if (targetSession === '2027' || targetSession === 'Session 2027') {
        targetSession = 'Session 27';
      }

      // If called with single name string (legacy or fallback)
      if (!targetGrade && name) {
        const cleanName = name.trim();
        const m = cleanName.match(/Class\s*(\d+)/i);
        targetGrade = m ? `Class ${m[1]}` : 'Class 6';

        if (/morning/i.test(cleanName)) targetShift = 'Morning';
        else if (/day/i.test(cleanName)) targetShift = 'Day';
        else targetShift = 'Morning';

        if (/science/i.test(cleanName)) targetGroup = 'Science';
        else if (/commerce/i.test(cleanName)) targetGroup = 'Commerce';
        else if (/arts/i.test(cleanName)) targetGroup = 'Arts';
        else targetGroup = 'General';
      }

      // Validate Grade (Class 6 - 10)
      const VALID_GRADES = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
      if (!VALID_GRADES.includes(targetGrade)) {
        throw new ApiError(`Invalid grade selected: "${targetGrade}". Hashmat Uddin High School offers Class 6 through Class 10 only.`, 400);
      }

      // Validate Shift (Morning, Day)
      const VALID_SHIFTS = ['Morning', 'Day'];
      if (!VALID_SHIFTS.includes(targetShift)) {
        throw new ApiError(`Invalid shift selected: "${targetShift}". Must be Morning or Day shift.`, 400);
      }

      // Validate Group for Class 9 and 10
      const isHigherGrade = targetGrade === 'Class 9' || targetGrade === 'Class 10';
      if (isHigherGrade) {
        const VALID_GROUPS = ['Science', 'Commerce', 'Arts'];
        if (!VALID_GROUPS.includes(targetGroup)) {
          throw new ApiError(`${targetGrade} requires a discipline group: Science, Commerce, or Arts.`, 400);
        }
      } else {
        targetGroup = 'General';
      }

      // Validate Seats
      const seats = parseInt(totalSeats, 10);
      if (isNaN(seats) || seats <= 0) {
        throw new ApiError('Total seats must be a positive integer greater than 0.', 400);
      }
      if (seats > 500) {
        throw new ApiError('Total seats cannot exceed 500 per class.', 400);
      }

      // Validate Fee (positive number)
      let cleanFee = parseInt(fee, 10);
      if (isNaN(cleanFee) || cleanFee <= 0) {
        cleanFee = isHigherGrade ? 1800 : 1500;
      }

      // Validate Admission Schedule Dates
      let startDate = admissionStartDate ? new Date(admissionStartDate).toISOString() : new Date().toISOString();
      let endDate = admissionEndDate ? new Date(admissionEndDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();

      if (new Date(endDate).getTime() <= new Date(startDate).getTime()) {
        throw new ApiError('Admission end date must be after the start date.', 400);
      }

      // Build canonical class name
      let canonicalName = '';
      if (isHigherGrade) {
        canonicalName = `${targetGrade} - ${targetGroup} (${targetShift})`;
      } else {
        canonicalName = `${targetGrade} - ${targetShift}`;
      }

      // Check unique constraint within the session
      const duplicate = Store.findDuplicateClass(targetGrade, targetShift, targetGroup, targetSession);
      if (duplicate) {
        throw new ApiError(
          `Class already exists: "${canonicalName}" is already created for ${targetSession}. Each class, group, and shift combination can have at most one section per academic session.`,
          409
        );
      }

      const newClass = {
        id: Utils.generateId('class'),
        name: canonicalName,
        grade: targetGrade,
        shift: targetShift,
        group: targetGroup,
        session: targetSession,
        totalSeats: seats,
        fee: cleanFee,
        admissionStartDate: startDate,
        admissionEndDate: endDate
      };

      Store.addClass(newClass);
      return Store.getClassSeatStats(newClass.id);
    },

    /**
     * Get Class Roster (Admitted and Reserved candidate lists)
     */
    async getClassRoster(classId) {
      await delay(160);
      Store.expireHolds();

      const classInfo = Store.getClassSeatStats(classId);
      if (!classInfo) {
        throw new ApiError('Class not found', 404);
      }

      const allHolds = Store.getHolds().filter(h => h.classId === classId);

      const admitted = allHolds
        .filter(h => h.status === 'CONFIRMED')
        .sort((a, b) => new Date(b.confirmedAt || b.createdAt) - new Date(a.confirmedAt || a.createdAt));

      const now = Date.now();
      const reserved = allHolds
        .filter(h => h.status === 'HELD' && new Date(h.expiresAt).getTime() > now)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(h => ({
          ...h,
          remainingSeconds: Math.max(0, Math.floor((new Date(h.expiresAt).getTime() - now) / 1000))
        }));

      const history = allHolds
        .filter(h => h.status === 'EXPIRED' || h.status === 'CANCELLED')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        classInfo,
        admitted,
        reserved,
        history,
        totalAdmitted: admitted.length,
        totalReserved: reserved.length,
        totalHistorical: history.length
      };
    },

    /**
     * Get full Student Admission Profile for Admin Details Popup
     */
    async getStudentAdmissionDetail(holdId) {
      await delay(120);
      Store.expireHolds();

      const hold = Store.getHoldById(holdId);
      if (!hold) {
        throw new ApiError('Student admission record not found.', 404);
      }

      const classInfo = Store.getClassSeatStats(hold.classId);
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
        isExpired: hold.status === 'EXPIRED' || (hold.status === 'HELD' && expTime <= now)
      };
    },

    /**
     * Evaluate global admission state for a student
     * Enforces the critical rule:
     * A student can have at most ONE HELD or ONE CONFIRMED admission globally.
     */
    async getStudentAdmissionSummary(studentId) {
      await delay(100);
      Store.expireHolds();

      if (!studentId || !Utils.isValid17DigitId(studentId)) {
        return {
          studentId: null,
          admissionState: 'NONE',
          currentApplication: null,
          canApply: true,
          reason: null
        };
      }

      const cleanId = String(studentId).trim();
      const holds = Store.getHoldsByStudent(cleanId);

      // Check for CONFIRMED first
      const confirmedHold = holds.find(h => h.status === 'CONFIRMED');
      if (confirmedHold) {
        const cls = Store.getClassById(confirmedHold.classId);
        return {
          studentId: cleanId,
          admissionState: 'CONFIRMED',
          currentApplication: {
            ...confirmedHold,
            className: cls ? cls.name : 'Unknown Class'
          },
          canApply: false,
          reason: `Your admission has already been confirmed for ${cls ? cls.name : 'a class'}. Multiple admissions are not permitted.`
        };
      }

      // Check for active unexpired HELD
      const now = Date.now();
      const activeHold = holds.find(h => {
        return h.status === 'HELD' && new Date(h.expiresAt).getTime() > now;
      });

      if (activeHold) {
        const cls = Store.getClassById(activeHold.classId);
        const remainingSeconds = Math.max(0, Math.floor((new Date(activeHold.expiresAt).getTime() - now) / 1000));
        return {
          studentId: cleanId,
          admissionState: 'HELD',
          currentApplication: {
            ...activeHold,
            className: cls ? cls.name : 'Unknown Class',
            remainingSeconds
          },
          canApply: false,
          reason: `You already have an active seat reservation in ${cls ? cls.name : 'a class'}. You must cancel it before selecting another class.`
        };
      }

      // Student has no active or confirmed holds (may have EXPIRED or CANCELLED)
      return {
        studentId: cleanId,
        admissionState: 'NONE',
        currentApplication: null,
        canApply: true,
        reason: null
      };
    },

    /**
     * Create a seat reservation (HOLD)
     * Rigorously checks student ID validity, seat availability, and global admission rule.
     */
    async createHold(classId, studentId) {
      await delay(250);
      Store.expireHolds();

      const cleanId = (studentId || '').trim();
      if (!Utils.isValid17DigitId(cleanId)) {
        throw new ApiError('A valid 17-digit birth registration number is required.', 400);
      }

      const classStats = Store.getClassSeatStats(classId);
      if (!classStats) {
        throw new ApiError('The selected class does not exist.', 404);
      }

      // Enforce Global Restriction: Student cannot have any active HELD or CONFIRMED admission
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

      // Check available seats
      if (classStats.availableSeats <= 0) {
        throw new ApiError(
          `No seats available: "${classStats.name}" is currently full. Please check back later or choose another class.`,
          400
        );
      }

      const durationSeconds = Utils.getHoldDurationSeconds();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationSeconds * 1000);

      const hold = {
        holdId: Utils.generateId('hold'),
        applicationCode: Utils.generateApplicationCode(),
        classId: classId,
        className: classStats.name,
        studentId: cleanId,
        status: 'HELD',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        durationSeconds: durationSeconds,
        confirmedAt: null,
        cancelledAt: null,
        expiredAt: null
      };

      Store.addHold(hold);

      return {
        ...hold,
        classInfo: classStats
      };
    },

    /**
     * Get hold details by holdId
     */
    async getHoldById(holdId) {
      await delay(120);
      Store.expireHolds();

      const hold = Store.getHoldById(holdId);
      if (!hold) {
        throw new ApiError('Application reservation not found.', 404);
      }

      const classInfo = Store.getClassSeatStats(hold.classId);
      const now = Date.now();
      const expTime = new Date(hold.expiresAt).getTime();
      const remainingSeconds = Math.max(0, Math.floor((expTime - now) / 1000));

      return {
        ...hold,
        className: classInfo ? classInfo.name : (hold.className || 'Unknown Class'),
        classInfo,
        remainingSeconds
      };
    },

    /**
     * Confirm admission payment simulation
     */
    async confirmHold(holdId, studentId) {
      await delay(280);
      Store.expireHolds();

      const hold = Store.getHoldById(holdId);
      if (!hold) {
        throw new ApiError('Application not found.', 404);
      }

      const cleanId = String(studentId).trim();
      if (String(hold.studentId).trim() !== cleanId) {
        throw new ApiError('This application does not match the active student identification.', 403);
      }

      // If already confirmed, return idempotently without duplicate seat assignment
      if (hold.status === 'CONFIRMED') {
        const classInfo = Store.getClassSeatStats(hold.classId);
        return {
          ...hold,
          classInfo,
          isAlreadyConfirmed: true
        };
      }

      // Check if expired
      const now = Date.now();
      if (hold.status === 'EXPIRED' || new Date(hold.expiresAt).getTime() <= now) {
        if (hold.status !== 'EXPIRED') {
          Store.updateHold(holdId, { status: 'EXPIRED', expiredAt: new Date().toISOString() });
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

      // Confirm the hold
      const confirmedAt = new Date().toISOString();
      const updated = Store.updateHold(holdId, {
        status: 'CONFIRMED',
        confirmedAt
      });

      const classInfo = Store.getClassSeatStats(hold.classId);

      return {
        ...updated,
        classInfo
      };
    },

    /**
     * Cancel an active seat reservation
     */
    async cancelHold(holdId, studentId) {
      await delay(200);
      Store.expireHolds();

      const hold = Store.getHoldById(holdId);
      if (!hold) {
        throw new ApiError('Application not found.', 404);
      }

      const cleanId = String(studentId).trim();
      if (String(hold.studentId).trim() !== cleanId) {
        throw new ApiError('This application does not match the active student identification.', 403);
      }

      if (hold.status === 'CONFIRMED') {
        throw new ApiError('Cannot cancel an admission that has already been confirmed.', 400);
      }

      if (hold.status === 'CANCELLED') {
        // Idempotent
        return hold;
      }

      if (hold.status === 'EXPIRED') {
        throw new ApiError('Reservation has already expired.', 400);
      }

      if (hold.status !== 'HELD') {
        throw new ApiError(`Cannot cancel application in "${hold.status}" state.`, 400);
      }

      const cancelledAt = new Date().toISOString();
      const updated = Store.updateHold(holdId, {
        status: 'CANCELLED',
        cancelledAt
      });

      const classInfo = Store.getClassSeatStats(hold.classId);

      return {
        ...updated,
        classInfo
      };
    },

    /**
     * Get all applications for a student
     */
    async getStudentHolds(studentId) {
      await delay(140);
      Store.expireHolds();

      if (!studentId) return [];

      const cleanId = String(studentId).trim();
      const holds = Store.getHoldsByStudent(cleanId);
      const classes = Store.getClasses();
      const classMap = new Map(classes.map(c => [c.id, c]));

      return holds.map(h => {
        const cls = classMap.get(h.classId);
        return {
          ...h,
          className: cls ? cls.name : (h.className || 'Unknown Class')
        };
      });
    },

    /**
     * Authority Portal high-level summary metrics
     */
    async getAuthoritySummary() {
      await delay(120);
      Store.expireHolds();

      const classes = Store.getAllClassesWithStats();
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

      const occupancyRate = totalCapacity > 0 ? Math.round(((totalHeld + totalConfirmed) / totalCapacity) * 100) : 0;

      return {
        totalClasses,
        totalCapacity,
        totalHeld,
        totalConfirmed,
        totalAvailable,
        occupancyRate,
        classes
      };
    }
  };

  window.MockApi = MockApi;
})(window);
