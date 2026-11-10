/**
 * test-part2-verification.mjs
 * Comprehensive automated verification test suite for Part 2: Student Admission Portal
 * Hashmat Uddin High School Online Admission System
 */

// In-memory localStorage polyfill for Node.js test environment
const memoryStore = new Map();
globalThis.localStorage = {
  getItem: (key) => memoryStore.get(key) || null,
  setItem: (key, val) => memoryStore.set(key, String(val)),
  removeItem: (key) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
};
globalThis.window = globalThis;

import assert from 'node:assert';
import { storageService } from './src/services/storageService.js';
import { apiService, ApiError } from './src/services/apiService.js';
import { isValid17DigitId, maskStudentId, formatTimeRemaining } from './src/utils/formatters.js';

let passedTests = 0;
let totalTests = 0;

function it(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

async function itAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    throw err;
  }
}

console.log('Starting Part 2 Student Admission Portal Verification Suite...\n');

// Initialize seed data & reset mock storage holds before testing
storageService.init();
storageService.saveHolds([]);

// -------------------------------------------------------------------------
// 1. Student Identity Validation
// -------------------------------------------------------------------------
console.log('1. Student Identity Validation:');

it('validates strictly 17-digit numeric IDs', () => {
  assert.strictEqual(isValid17DigitId('20080123456789012'), true);
  assert.strictEqual(isValid17DigitId('19981234567890123'), true);
  // Invalid lengths
  assert.strictEqual(isValid17DigitId('2008012345678901'), false); // 16 digits
  assert.strictEqual(isValid17DigitId('200801234567890123'), false); // 18 digits
  // Non-numeric
  assert.strictEqual(isValid17DigitId('2008012345678901A'), false);
  assert.strictEqual(isValid17DigitId(''), false);
  assert.strictEqual(isValid17DigitId(null), false);
});

it('masks student ID correctly preserving first 4 and last 4 digits', () => {
  const masked = maskStudentId('20080123456789012');
  assert.strictEqual(masked, '2008 •••• •••• 9012');
});

// -------------------------------------------------------------------------
// 2. Class Quota & Seat Matrix Discovery
// -------------------------------------------------------------------------
console.log('\n2. Class Quota & Seat Matrix:');

await itAsync('fetches all classes with 4-tier seat metrics (Total, Held, Confirmed, Available)', async () => {
  const classes = await apiService.getClasses();
  assert.ok(Array.isArray(classes));
  assert.ok(classes.length >= 6, 'Should have at least 6 configured classes');

  for (const c of classes) {
    assert.ok(c.id, 'Class must have an ID');
    assert.ok(c.name, 'Class must have a name');
    assert.strictEqual(typeof c.totalSeats, 'number', 'totalSeats must be number');
    assert.strictEqual(typeof c.heldSeats, 'number', 'heldSeats must be number');
    assert.strictEqual(typeof c.confirmedSeats, 'number', 'confirmedSeats must be number');
    assert.strictEqual(typeof c.availableSeats, 'number', 'availableSeats must be number');
    assert.strictEqual(
      c.availableSeats,
      Math.max(0, c.totalSeats - c.heldSeats - c.confirmedSeats),
      'Available seats must match Total - Held - Confirmed'
    );
  }
});

// -------------------------------------------------------------------------
// 3. Admission Reservation Lifecycle (HELD state)
// -------------------------------------------------------------------------
console.log('\n3. Reservation Lifecycle (HELD State):');

const studentA = '20081234567890001';
let holdA = null;

await itAsync('creates a seat reservation with valid 17-digit student ID', async () => {
  const classes = await apiService.getClasses();
  const targetClass = classes[0];
  const initialAvailable = targetClass.availableSeats;

  holdA = await apiService.createHold(targetClass.id, studentA);
  assert.ok(holdA.holdId, 'Hold must have a unique ID');
  assert.strictEqual(holdA.studentId, studentA);
  assert.strictEqual(holdA.classId, targetClass.id);
  assert.strictEqual(holdA.status, 'HELD');
  assert.ok(holdA.applicationCode.startsWith('HUHS-2026-'));
  assert.ok(holdA.remainingSeconds > 0 && holdA.remainingSeconds <= 600);

  // Verify class seat metrics updated immediately
  const updatedClass = await apiService.getClassById(targetClass.id);
  assert.strictEqual(updatedClass.heldSeats, 1);
  assert.strictEqual(updatedClass.availableSeats, initialAvailable - 1);
});

await itAsync('reads hold details and computes accurate remainingSeconds', async () => {
  const fetched = await apiService.getHoldById(holdA.holdId);
  assert.strictEqual(fetched.holdId, holdA.holdId);
  assert.strictEqual(fetched.status, 'HELD');
  assert.ok(fetched.remainingSeconds > 0);
  assert.strictEqual(fetched.className, holdA.className);
});

// -------------------------------------------------------------------------
// 4. Global Single-Admission Rule Enforcement
// -------------------------------------------------------------------------
console.log('\n4. Global Single-Admission Rule Enforcement:');

await itAsync('blocks a second reservation attempt while an active hold exists (different class)', async () => {
  const classes = await apiService.getClasses();
  const otherClass = classes[1];

  let threwError = false;
  try {
    await apiService.createHold(otherClass.id, studentA);
  } catch (err) {
    threwError = true;
    assert.ok(err instanceof ApiError);
    assert.strictEqual(err.status, 409);
    assert.ok(err.message.includes('Active reservation exists'));
  }
  assert.strictEqual(threwError, true, 'Second hold must be blocked by single-admission rule');
});

await itAsync('blocks a second reservation attempt for the SAME class', async () => {
  let threwError = false;
  try {
    await apiService.createHold(holdA.classId, studentA);
  } catch (err) {
    threwError = true;
    assert.ok(err instanceof ApiError);
    assert.strictEqual(err.status, 409);
  }
  assert.strictEqual(threwError, true, 'Duplicate hold on same class must be blocked');
});

// -------------------------------------------------------------------------
// 5. Payment Confirmation & Printable Admission Slip (CONFIRMED state)
// -------------------------------------------------------------------------
console.log('\n5. Payment Confirmation & CONFIRMED State:');

let confirmedA = null;

await itAsync('confirms seat reservation after simulated payment', async () => {
  confirmedA = await apiService.confirmHold(holdA.holdId, studentA);
  assert.strictEqual(confirmedA.status, 'CONFIRMED');
  assert.ok(confirmedA.confirmedAt);

  // Check seat counts updated: held decrements by 1, confirmed increments by 1
  const updatedClass = await apiService.getClassById(holdA.classId);
  assert.strictEqual(updatedClass.heldSeats, 0);
  assert.strictEqual(updatedClass.confirmedSeats, 1);
});

await itAsync('permanently blocks another reservation once admission is CONFIRMED', async () => {
  const classes = await apiService.getClasses();
  const targetClass = classes[2];

  let threwError = false;
  try {
    await apiService.createHold(targetClass.id, studentA);
  } catch (err) {
    threwError = true;
    assert.ok(err instanceof ApiError);
    assert.strictEqual(err.status, 409);
    assert.ok(err.message.includes('Admission already confirmed'));
  }
  assert.strictEqual(threwError, true, 'Confirmed student cannot reserve any other class');
});

// -------------------------------------------------------------------------
// 6. Reservation Cancellation & Seat Return (CANCELLED state)
// -------------------------------------------------------------------------
console.log('\n6. Reservation Cancellation & Seat Return:');

const studentB = '20081234567890002';
let holdB = null;

await itAsync('creates a reservation for Student B and verifies initial held status', async () => {
  const classes = await apiService.getClasses();
  const cls = classes[0];
  const availBefore = cls.availableSeats;

  holdB = await apiService.createHold(cls.id, studentB);
  assert.strictEqual(holdB.status, 'HELD');

  const afterHold = await apiService.getClassById(cls.id);
  assert.strictEqual(afterHold.availableSeats, availBefore - 1);
});

await itAsync('cancels Student B reservation and returns seat to available pool', async () => {
  const cls = await apiService.getClassById(holdB.classId);
  const availBeforeCancel = cls.availableSeats;

  const cancelled = await apiService.cancelHold(holdB.holdId, studentB);
  assert.strictEqual(cancelled.status, 'CANCELLED');
  assert.ok(cancelled.cancelledAt);

  const afterCancel = await apiService.getClassById(holdB.classId);
  assert.strictEqual(afterCancel.availableSeats, availBeforeCancel + 1);
  assert.strictEqual(afterCancel.heldSeats, 0);
});

await itAsync('allows Student B to reserve a new class after cancellation', async () => {
  const classes = await apiService.getClasses();
  const newClass = classes[3];

  const newHold = await apiService.createHold(newClass.id, studentB);
  assert.strictEqual(newHold.status, 'HELD');
  assert.strictEqual(newHold.classId, newClass.id);
});

// -------------------------------------------------------------------------
// 7. Expiration Behavior (EXPIRED state)
// -------------------------------------------------------------------------
console.log('\n7. Hold Expiration Behavior:');

const studentC = '20081234567890003';

await itAsync('releases held seat and marks status as EXPIRED when hold time elapses', async () => {
  const classes = await apiService.getClasses();
  const cls = classes[1];
  const initialAvail = cls.availableSeats;

  const holdC = await apiService.createHold(cls.id, studentC);
  assert.strictEqual(holdC.status, 'HELD');

  // Fast-forward hold expiry timestamp into the past
  const pastTime = new Date(Date.now() - 5000).toISOString();
  storageService.updateHold(holdC.holdId, { expiresAt: pastTime });

  // Trigger expiration check
  const expiredHold = await apiService.getHoldById(holdC.holdId);
  assert.strictEqual(expiredHold.status, 'EXPIRED');

  // Verify seat was returned to available pool
  const refreshedCls = await apiService.getClassById(cls.id);
  assert.strictEqual(refreshedCls.availableSeats, initialAvail);
  assert.strictEqual(refreshedCls.heldSeats, 0);
});

await itAsync('rejects payment confirmation on an expired hold', async () => {
  const holds = await apiService.getStudentHolds(studentC);
  const expired = holds.find(h => h.status === 'EXPIRED');
  assert.ok(expired);

  let threwError = false;
  try {
    await apiService.confirmHold(expired.holdId, studentC);
  } catch (err) {
    threwError = true;
    assert.ok(err.message.includes('expired') || err.status === 400);
  }
  assert.strictEqual(threwError, true, 'Cannot confirm an expired hold');
});

// -------------------------------------------------------------------------
// 8. Multi-Student Data Isolation
// -------------------------------------------------------------------------
console.log('\n8. Multi-Student Data Isolation:');

await itAsync('ensures student applications are strictly isolated by 17-digit birth ID', async () => {
  const holdsA = await apiService.getStudentHolds(studentA);
  const holdsB = await apiService.getStudentHolds(studentB);
  const holdsC = await apiService.getStudentHolds(studentC);

  // Student A has 1 CONFIRMED
  assert.strictEqual(holdsA.length, 1);
  assert.strictEqual(holdsA[0].studentId, studentA);
  assert.strictEqual(holdsA[0].status, 'CONFIRMED');

  // Student B has 1 CANCELLED and 1 HELD
  assert.strictEqual(holdsB.length, 2);
  assert.ok(holdsB.every(h => h.studentId === studentB));

  // Student C has 1 EXPIRED
  assert.strictEqual(holdsC.length, 1);
  assert.strictEqual(holdsC[0].studentId, studentC);
  assert.strictEqual(holdsC[0].status, 'EXPIRED');
});

// -------------------------------------------------------------------------
// 9. Input & Edge Case Rejection
// -------------------------------------------------------------------------
console.log('\n9. Input & Edge Cases:');

await itAsync('rejects reservation with non-17-digit student ID', async () => {
  const classes = await apiService.getClasses();
  let threwError = false;
  try {
    await apiService.createHold(classes[0].id, '12345');
  } catch (err) {
    threwError = true;
    assert.strictEqual(err.status, 400);
  }
  assert.strictEqual(threwError, true);
});

await itAsync('rejects reservation when class is full', async () => {
  const classes = await apiService.getClasses();
  const cls = classes[0];

  // Set totalSeats = confirmedSeats so availableSeats becomes 0
  const updatedClasses = storageService
    .getClasses()
    .map((c) => (c.id === cls.id ? { ...c, totalSeats: 1 } : c));
  storageService.saveClasses(updatedClasses);

  const fullCls = await apiService.getClassById(cls.id);
  assert.strictEqual(fullCls.availableSeats, 0);

  const studentE = '20081234567890005';
  let threwError = false;
  try {
    await apiService.createHold(cls.id, studentE);
  } catch (err) {
    threwError = true;
    assert.ok(err.message.includes('No seats available') || err.message.includes('full'));
  }
  assert.strictEqual(threwError, true);
});

console.log(`\n======================================================`);
console.log(`Part 2 Verification Suite Complete: ${passedTests}/${totalTests} assertions passed!`);
console.log(`======================================================\n`);
