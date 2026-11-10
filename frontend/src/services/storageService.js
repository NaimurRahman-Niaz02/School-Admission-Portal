/**
 * storageService.js - Web Storage Persistence Engine and Seed Data
 * Hashmat Uddin High School Online Admission System
 */

const STORAGE_KEYS = {
  CLASSES: 'gia_admission_classes_v2',
  HOLDS: 'gia_admission_holds_v2',
  CURRENT_STUDENT_ID: 'gia_current_student_id_v2',
  REMEMBER_STUDENT: 'gia_remember_student_v2',
  ADMIN_AUTH: 'gia_admin_authenticated_v2',
  TIMELINE: 'gia_admission_timeline_v2',
};

// Seed classes reflecting Class 6-10 with shifts, groups, fees & schedule
const SEED_CLASSES = [
  {
    id: 'class_001',
    name: 'Class 6 - Morning',
    grade: 'Class 6',
    shift: 'Morning',
    group: 'General',
    session: 'Session 27',
    totalSeats: 40,
    fee: 1500,
    admissionStartDate: '2026-11-01T08:00:00.000Z',
    admissionEndDate: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 'class_002',
    name: 'Class 6 - Day',
    grade: 'Class 6',
    shift: 'Day',
    group: 'General',
    session: 'Session 27',
    totalSeats: 40,
    fee: 1500,
    admissionStartDate: '2026-11-01T08:00:00.000Z',
    admissionEndDate: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 'class_003',
    name: 'Class 7 - Morning',
    grade: 'Class 7',
    shift: 'Morning',
    group: 'General',
    session: 'Session 27',
    totalSeats: 35,
    fee: 1500,
    admissionStartDate: '2026-11-01T08:00:00.000Z',
    admissionEndDate: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 'class_004',
    name: 'Class 7 - Day',
    grade: 'Class 7',
    shift: 'Day',
    group: 'General',
    session: 'Session 27',
    totalSeats: 35,
    fee: 1500,
    admissionStartDate: '2026-11-01T08:00:00.000Z',
    admissionEndDate: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 'class_005',
    name: 'Class 8 - Morning',
    grade: 'Class 8',
    shift: 'Morning',
    group: 'General',
    session: 'Session 27',
    totalSeats: 30,
    fee: 1600,
    admissionStartDate: '2026-11-01T08:00:00.000Z',
    admissionEndDate: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 'class_006',
    name: 'Class 8 - Day',
    grade: 'Class 8',
    shift: 'Day',
    group: 'General',
    session: 'Session 27',
    totalSeats: 30,
    fee: 1600,
    admissionStartDate: '2026-11-01T08:00:00.000Z',
    admissionEndDate: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 'class_007',
    name: 'Class 9 - Science (Morning)',
    grade: 'Class 9',
    shift: 'Morning',
    group: 'Science',
    session: 'Session 27',
    totalSeats: 30,
    fee: 1800,
    admissionStartDate: '2026-11-01T08:00:00.000Z',
    admissionEndDate: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 'class_008',
    name: 'Class 9 - Commerce (Day)',
    grade: 'Class 9',
    shift: 'Day',
    group: 'Commerce',
    session: 'Session 27',
    totalSeats: 25,
    fee: 1800,
    admissionStartDate: '2026-11-01T08:00:00.000Z',
    admissionEndDate: '2026-11-30T23:59:59.000Z',
  },
  {
    id: 'class_009',
    name: 'Class 10 - Science (Morning)',
    grade: 'Class 10',
    shift: 'Morning',
    group: 'Science',
    session: 'Session 27',
    totalSeats: 25,
    fee: 2000,
    admissionStartDate: '2026-11-01T08:00:00.000Z',
    admissionEndDate: '2026-11-30T23:59:59.000Z',
  },
];

// Seed baseline admissions
const SEED_HOLDS = [
  {
    holdId: 'hold_seed_001',
    applicationCode: 'HUHS-2026-810231',
    classId: 'class_001',
    studentId: '20081234567890001',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 * 2 + 600000).toISOString(),
    confirmedAt: new Date(Date.now() - 86400000 * 2 + 180000).toISOString(),
  },
  {
    holdId: 'hold_seed_002',
    applicationCode: 'HUHS-2026-810232',
    classId: 'class_001',
    studentId: '20081234567890002',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 * 1.5 + 600000).toISOString(),
    confirmedAt: new Date(Date.now() - 86400000 * 1.5 + 240000).toISOString(),
  },
  {
    holdId: 'hold_seed_003',
    applicationCode: 'HUHS-2026-810233',
    classId: 'class_003',
    studentId: '20081234567890003',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 + 600000).toISOString(),
    confirmedAt: new Date(Date.now() - 86400000 + 120000).toISOString(),
  },
  {
    holdId: 'hold_seed_004',
    applicationCode: 'HUHS-2026-810234',
    classId: 'class_007',
    studentId: '20081234567890004',
    status: 'CONFIRMED',
    createdAt: new Date(Date.now() - 86400000 * 0.8).toISOString(),
    expiresAt: new Date(Date.now() - 86400000 * 0.8 + 600000).toISOString(),
    confirmedAt: new Date(Date.now() - 86400000 * 0.8 + 150000).toISOString(),
  },
];

export const storageService = {
  init() {
    try {
      if (typeof window === 'undefined') return;

      if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(SEED_CLASSES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.HOLDS)) {
        localStorage.setItem(STORAGE_KEYS.HOLDS, JSON.stringify(SEED_HOLDS));
      }
      this.normalizeClasses();
      this.expireHolds();
    } catch (err) {
      console.error('storageService init error:', err);
    }
  },

  normalizeClasses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
      if (!raw) return;
      const classes = JSON.parse(raw);
      let updated = false;

      for (const c of classes) {
        if (!c.session) {
          c.session = 'Session 27';
          updated = true;
        }
        if (!c.grade) {
          const m = (c.name || '').match(/Class\s*(\d+)/i);
          c.grade = m ? `Class ${m[1]}` : 'Class 6';
          updated = true;
        }
        if (!c.shift) {
          if (/morning/i.test(c.name)) c.shift = 'Morning';
          else if (/day/i.test(c.name)) c.shift = 'Day';
          else c.shift = 'Morning';
          updated = true;
        }
        if (!c.group) {
          if (/science/i.test(c.name)) c.group = 'Science';
          else if (/commerce/i.test(c.name)) c.group = 'Commerce';
          else if (/arts|humanities/i.test(c.name)) c.group = 'Arts';
          else c.group = 'General';
          updated = true;
        }
        if (!c.fee) {
          c.fee = c.grade === 'Class 9' || c.grade === 'Class 10' ? 1800 : 1500;
          updated = true;
        }
        if (!c.admissionStartDate) {
          c.admissionStartDate = '2026-11-01T08:00:00.000Z';
          updated = true;
        }
        if (!c.admissionEndDate) {
          c.admissionEndDate = '2026-11-30T23:59:59.000Z';
          updated = true;
        }
      }

      if (updated) {
        this.saveClasses(classes);
      }
    } catch (e) {
      console.warn('Class normalization warning:', e);
    }
  },

  getClasses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to parse classes:', e);
      return [];
    }
  },

  saveClasses(classes) {
    try {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    } catch (e) {
      console.error('Failed to save classes:', e);
    }
  },

  addClass(classData) {
    const classes = this.getClasses();
    classes.push(classData);
    this.saveClasses(classes);
    return classData;
  },

  getClassById(classId) {
    const classes = this.getClasses();
    return classes.find((c) => c.id === classId) || null;
  },

  findDuplicateClass(grade, shift, group, session, excludeId = null) {
    const classes = this.getClasses();
    const normGrade = (grade || '').trim().toLowerCase();
    const normShift = (shift || '').trim().toLowerCase();
    const normGroup = (group || 'General').trim().toLowerCase();

    const normalizeSession = (s) => {
      const str = (s || 'Session 27').trim().toLowerCase();
      if (str === '2027' || str === 'session 27' || str === 'session 2027' || str.includes('2026–2027') || str.includes('2026-2027')) {
        return 'session 27';
      }
      return str;
    };

    const normSession = normalizeSession(session);

    return (
      classes.find((c) => {
        if (excludeId && c.id === excludeId) return false;
        const cGrade = (c.grade || '').trim().toLowerCase();
        const cShift = (c.shift || '').trim().toLowerCase();
        const cGroup = (c.group || 'General').trim().toLowerCase();
        const cSession = normalizeSession(c.session);

        return cGrade === normGrade && cShift === normShift && cGroup === normGroup && cSession === normSession;
      }) || null
    );
  },

  getHolds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HOLDS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to parse holds:', e);
      return [];
    }
  },

  saveHolds(holds) {
    try {
      localStorage.setItem(STORAGE_KEYS.HOLDS, JSON.stringify(holds));
    } catch (e) {
      console.error('Failed to save holds:', e);
    }
  },

  addHold(hold) {
    const holds = this.getHolds();
    holds.push(hold);
    this.saveHolds(holds);
    return hold;
  },

  updateHold(holdId, patch) {
    const holds = this.getHolds();
    const index = holds.findIndex((h) => h.holdId === holdId);
    if (index === -1) return null;

    holds[index] = { ...holds[index], ...patch };
    this.saveHolds(holds);
    return holds[index];
  },

  getHoldById(holdId) {
    this.expireHolds();
    const holds = this.getHolds();
    return holds.find((h) => h.holdId === holdId) || null;
  },

  getHoldsByStudent(studentId) {
    if (!studentId) return [];
    this.expireHolds();
    const holds = this.getHolds();
    return holds
      .filter((h) => String(h.studentId).trim() === String(studentId).trim())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  expireHolds() {
    try {
      const holds = this.getHolds();
      const now = Date.now();
      let changed = false;

      for (const hold of holds) {
        if (hold.status === 'HELD') {
          const exp = new Date(hold.expiresAt).getTime();
          if (exp <= now) {
            hold.status = 'EXPIRED';
            hold.expiredAt = new Date().toISOString();
            changed = true;
          }
        }
      }

      if (changed) {
        this.saveHolds(holds);
      }
      return changed;
    } catch (err) {
      console.error('Error during expireHolds:', err);
      return false;
    }
  },

  getClassSeatStats(classId) {
    this.expireHolds();
    const cls = this.getClassById(classId);
    if (!cls) return null;

    const holds = this.getHolds().filter((h) => h.classId === classId);
    const heldSeats = holds.filter((h) => h.status === 'HELD').length;
    const confirmedSeats = holds.filter((h) => h.status === 'CONFIRMED').length;
    const totalSeats = Number(cls.totalSeats) || 0;
    const availableSeats = Math.max(0, totalSeats - heldSeats - confirmedSeats);

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
      occupancyRate: totalSeats > 0 ? Math.round(((heldSeats + confirmedSeats) / totalSeats) * 100) : 0,
    };
  },

  getAllClassesWithStats() {
    this.expireHolds();
    const classes = this.getClasses();
    return classes.map((cls) => this.getClassSeatStats(cls.id));
  },

  getSavedStudentId() {
    try {
      const remember = localStorage.getItem(STORAGE_KEYS.REMEMBER_STUDENT);
      if (remember === 'false') {
        return sessionStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
      }
      return localStorage.getItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
    } catch {
      return null;
    }
  },

  saveStudentId(studentId, remember = true) {
    try {
      if (!studentId) {
        this.clearStudentId();
        return;
      }
      const clean = String(studentId).trim();
      localStorage.setItem(STORAGE_KEYS.REMEMBER_STUDENT, remember ? 'true' : 'false');
      if (remember) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT_ID, clean);
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
      } else {
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_STUDENT_ID, clean);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
      }
    } catch (e) {
      console.error('Failed to save student ID:', e);
    }
  },

  clearStudentId() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_STUDENT_ID);
    } catch (e) {
      console.error('Failed to clear student ID:', e);
    }
  },

  isRememberStudent() {
    try {
      return localStorage.getItem(STORAGE_KEYS.REMEMBER_STUDENT) !== 'false';
    } catch {
      return true;
    }
  },

  isAdminAuthenticated() {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  },

  setAdminAuthenticated(auth = true) {
    try {
      if (auth) {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      }
    } catch (e) {
      console.error('Admin session save error:', e);
    }
  },

  getTimeline() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TIMELINE);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return {
      startDate: '2026-11-01T08:00:00.000Z',
      endDate: '2026-11-30T23:59:59.000Z',
    };
  },

  saveTimeline(timeline) {
    try {
      const clean = {
        startDate: new Date(timeline.startDate).toISOString(),
        endDate: new Date(timeline.endDate).toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(clean));

      const classes = this.getClasses();
      let changed = false;
      for (const c of classes) {
        c.admissionStartDate = clean.startDate;
        c.admissionEndDate = clean.endDate;
        changed = true;
      }
      if (changed) {
        this.saveClasses(classes);
      }
      return clean;
    } catch (e) {
      console.error('Failed to save timeline:', e);
      return timeline;
    }
  },
};

// Auto initialize on module load
storageService.init();

export default storageService;

