/**
 * formatters.js - Validation, String Manipulation, and Date/Time Utilities
 * Hashmat Uddin High School Online Admission System
 */

/**
 * Validate 17-digit numeric string (Bangladesh Birth Registration Number standard)
 */
export function isValid17DigitId(id) {
  if (!id) return false;
  return /^\d{17}$/.test(String(id).trim());
}

export function isValidStudentId(id) {
  return isValid17DigitId(id);
}

/**
 * Format 17-digit birth registration number:
 * Shows first 4 and last 4 digits, masks the middle 9 digits.
 * e.g., "2008 •••• •••• 5678"
 */
export function maskStudentId(id) {
  if (!id) return '';
  const clean = String(id).trim();
  if (clean.length !== 17) {
    return clean.length > 4 ? `•••• ${clean.slice(-4)}` : '••••';
  }
  const first4 = clean.slice(0, 4);
  const last4 = clean.slice(-4);
  return `${first4} •••• •••• ${last4}`;
}

/**
 * Human-friendly date and time formatting
 */
export function formatDate(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Format a compact date (e.g. Nov 09, 2026)
 */
export function formatDateShort(dateInput) {
  if (!dateInput) return '—';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

/**
 * Formats seconds into MM:SS
 */
export function formatTimeRemaining(totalSeconds) {
  if (totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formats milliseconds into Days, Hours, Minutes, Seconds
 * e.g., "19d 08h 45m 12s"
 */
export function formatDhms(ms) {
  if (!ms || ms <= 0) {
    return '00d 00h 00m 00s';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
}

/**
 * Read holdSeconds query parameter if present for testing fast-forward
 */
export function getHoldDurationSeconds() {
  try {
    if (typeof window !== 'undefined' && window.location?.href) {
      const fullUrl = window.location.href || '';
      const match = fullUrl.match(/[?&]holdSeconds=(\d+)/);
      if (match && match[1]) {
        const val = parseInt(match[1], 10);
        if (val > 0 && val <= 3600) {
          return val;
        }
      }
    }
  } catch {
    // ignore
  }
  return 600; // 10 minutes default
}

/**
 * Generate unique identifier
 */
export function generateId(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}_${timestamp}${random}`;
}

/**
 * Generate readable application code (e.g. HUHS-2026-810231)
 */
export function generateApplicationCode() {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `HUHS-${year}-${rand}`;
}

