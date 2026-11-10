/**
 * admissionConfig.js - Admission Academic Rules and Timeline Configuration
 * Hashmat Uddin High School Online Admission System
 */

export const admissionConfig = {
  sessionName: 'Session 27',
  sessionFullName: 'Academic Session 2026–2027 (Session 27)',
  academicYear: '2027',
  defaultHoldDurationSeconds: 600, // 10 minutes

  hero: {
    badge: 'Admission Open 2027',
    title: 'Secure Your Seat for 2027!',
    description: 'Start your journey with Hashmat Uddin High School. Secure your seat for Session 2027',
    taglineHighlight: 'First to Apply, First to Belong',
  },

  defaultTimeline: {
    startDate: '2026-11-01T08:00:00.000Z',
    endDate: '2026-11-30T23:59:59.000Z',
    displayRange: 'Nov 01, 2026 — Nov 30, 2026',
  },

  shifts: [
    {
      id: 'morning',
      name: 'Morning Shift',
      badgeClass: 'badge-morning',
      cardClass: 'shift-morning-card',
      iconClass: 'icon-morning',
      timeRange: '07:30 AM – 12:00 PM',
      applicableGrades: 'Class 6 through Class 10',
      assemblyTime: '07:15 AM',
    },
    {
      id: 'day',
      name: 'Day Shift',
      badgeClass: 'badge-day',
      cardClass: 'shift-day-card',
      iconClass: 'icon-day',
      timeRange: '12:30 PM – 05:00 PM',
      applicableGrades: 'Class 6 through Class 10',
      assemblyTime: '12:15 PM',
    },
  ],

  feeSchedule: [
    { grade: 'Class 6', group: 'General', groupClass: '', fee: 1500 },
    { grade: 'Class 7', group: 'General', groupClass: '', fee: 1500 },
    { grade: 'Class 8', group: 'General', groupClass: '', fee: 1500 },
    { grade: 'Class 9', group: 'Science', groupClass: 'text-teal font-semibold', fee: 1800 },
    { grade: 'Class 9', group: 'Commerce', groupClass: 'font-semibold', fee: 1700 },
    { grade: 'Class 9', group: 'Arts (Humanities)', groupClass: 'font-semibold', fee: 1700 },
    { grade: 'Class 10', group: 'Science', groupClass: 'text-teal font-semibold', fee: 1800 },
    { grade: 'Class 10', group: 'Commerce', groupClass: 'font-semibold', fee: 1700 },
    { grade: 'Class 10', group: 'Arts (Humanities)', groupClass: 'font-semibold', fee: 1700 },
  ],

  /**
   * Format timeline date range or return 'To be announced'
   */
  formatTimelineRange(startDate, endDate) {
    if (!startDate || !endDate) return 'To be announced';
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'To be announced';
    }

    const fmt = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

    return `${fmt.format(start)} — ${fmt.format(end)}`;
  },
};

export default admissionConfig;
