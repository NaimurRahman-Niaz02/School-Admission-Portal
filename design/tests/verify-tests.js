/**
 * Verification test runner for School Admission Portal
 */
const fs = require('fs');
const path = require('path');

// Mock localStorage and sessionStorage
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] !== undefined ? storage[key] : null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; },
  clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
};

const sessionStorageData = {};
global.sessionStorage = {
  getItem: (key) => sessionStorageData[key] !== undefined ? sessionStorageData[key] : null,
  setItem: (key, val) => { sessionStorageData[key] = String(val); },
  removeItem: (key) => { delete sessionStorageData[key]; },
  clear: () => { Object.keys(sessionStorageData).forEach(k => delete sessionStorageData[k]); }
};

// Mock window and document
global.window = {
  localStorage: global.localStorage,
  sessionStorage: global.sessionStorage,
  location: { href: 'http://localhost:8080/#/', search: '', hash: '#/' },
  addEventListener: () => {}
};

// Load modules in order
function loadScript(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  eval(code);
}

loadScript(path.join(__dirname, '../js/utils.js'));
global.Utils = window.Utils;
loadScript(path.join(__dirname, '../js/store.js'));
global.Store = window.Store;
loadScript(path.join(__dirname, '../js/mockApi.js'));
global.MockApi = window.MockApi;
loadScript(path.join(__dirname, '../js/state.js'));
global.AppState = window.AppState;

async function runTests() {
  console.log('=== STARTING TEST SUITE ===');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Utils testing
  console.log('\n--- 1. Utils Tests ---');
  assert(Utils.isValid17DigitId('20081234567890123') === true, '17-digit numeric string is valid');
  assert(Utils.isValid17DigitId('2008123456789012') === false, '16-digit numeric string is invalid');
  assert(Utils.isValid17DigitId('200812345678901234') === false, '18-digit numeric string is invalid');
  assert(Utils.isValid17DigitId('2008123456789012a') === false, 'Non-digit characters are invalid');
  assert(Utils.maskStudentId('20081234567890123') === '2008 •••• •••• 0123', 'Masked student ID matches format');
  assert(typeof Utils.formatDhms(3600000) === 'string', 'formatDhms returns string');
  assert(Utils.formatDhms(0) === '00d 00h 00m 00s', 'formatDhms(0) returns formatted zero timer');

  // 2. Store & Seed data
  console.log('\n--- 2. Store & Seed Data Tests ---');
  Store.init();
  const classes = Store.getClasses();
  assert(classes.length >= 6, `Seed classes loaded (found ${classes.length})`);
  const firstClass = classes[0];
  assert(firstClass.fee > 0, `Class has admission fee (fee: ৳${firstClass.fee})`);
  assert(firstClass.admissionStartDate !== undefined, 'Class has admissionStartDate');
  assert(firstClass.admissionEndDate !== undefined, 'Class has admissionEndDate');
  assert(firstClass.session === 'Session 27', `Class is assigned to Session 27 (session: ${firstClass.session})`);

  // 3. Admin Authentication & Verification Gate
  console.log('\n--- 3. Admin Authentication Tests ---');
  assert(Store.isAdminAuthenticated() === false, 'Admin is initially unauthenticated');
  let wrongPassFailed = false;
  try {
    await MockApi.verifyAdminPassword('wrongpassword');
  } catch (err) {
    wrongPassFailed = true;
    assert(err.status === 401, 'Wrong password fails with 401 status');
  }
  assert(wrongPassFailed === true, 'Wrong password rejected');
  const rightPass = await MockApi.verifyAdminPassword('admin2026');
  assert(rightPass.ok === true, 'admin2026 passes verification');
  assert(Store.isAdminAuthenticated() === true, 'Store now marks admin as authenticated');
  await MockApi.logoutAdmin();
  assert(Store.isAdminAuthenticated() === false, 'Admin logout locks the session');

  // 4. Admin Class Creation & Uniqueness Rules
  console.log('\n--- 4. Class Creation & Uniqueness Tests ---');
  // Attempt duplicate class for Session 27 (Class 6 - Morning already exists)
  let duplicateCaught = false;
  try {
    await MockApi.createClass({
      grade: 'Class 6',
      shift: 'Morning',
      group: 'General',
      session: 'Session 27',
      totalSeats: 35,
      fee: 1500,
      admissionStartDate: '2026-11-01T08:00',
      admissionEndDate: '2026-11-30T23:59'
    });
  } catch (err) {
    duplicateCaught = true;
    assert(err.status === 409, `Duplicate section rejected with 409: ${err.message}`);
  }
  assert(duplicateCaught === true, 'Duplicate section prevention triggered');

  // Create unique Class 10 - Science (Day)
  const newClass = await MockApi.createClass({
    grade: 'Class 10',
    shift: 'Day',
    group: 'Science',
    session: 'Session 27',
    totalSeats: 35,
    fee: 1800,
    admissionStartDate: '2026-11-01T08:00',
    admissionEndDate: '2026-11-30T23:59'
  });
  assert(newClass && newClass.id, `New Class 10 Science Day created successfully with ID: ${newClass.id}`);
  assert(newClass.fee === 1800, 'New class has correct fee of ৳1800');

  // 5. Student Admission Flow & Global Single Reservation Rule
  console.log('\n--- 5. Student Admission Lifecycle & Single-Hold Constraint ---');
  const studentA = '20089999999990001';
  const targetClassId = classes[0].id;
  const initialStats = Store.getClassSeatStats(targetClassId);
  const initialAvailable = initialStats.availableSeats;

  // Step A: Reserve seat
  const hold = await MockApi.createHold(targetClassId, studentA);
  assert(hold && hold.holdId, `Seat reserved with holdId: ${hold.holdId}`);
  assert(hold.status === 'HELD', 'Hold status is HELD');

  // Check quota update
  const updatedClass = Store.getClassSeatStats(targetClassId);
  assert(updatedClass.availableSeats === initialAvailable - 1, `Available seats decreased by 1 (${initialAvailable} -> ${updatedClass.availableSeats})`);
  assert(updatedClass.heldSeats === 1, 'Held seats increased to 1');

  // Step B: Attempt a second reservation for same student in different class
  let secondHoldCaught = false;
  try {
    const anotherClassId = classes[1].id;
    await MockApi.createHold(anotherClassId, studentA);
  } catch (err) {
    secondHoldCaught = true;
    assert((err.status === 409 || err.status === 400) && err.message.includes('already have an active seat hold'), `Second hold blocked: ${err.message}`);
  }
  assert(secondHoldCaught === true, 'Global single-hold constraint enforced across school');

  // Step C: Confirm admission fee
  const initialConfirmed = initialStats.confirmedSeats;
  const confirmed = await MockApi.confirmHold(hold.holdId, studentA);
  assert(confirmed.status === 'CONFIRMED', 'Admission successfully confirmed');
  assert(confirmed.confirmedAt !== undefined, 'Confirmed record has confirmedAt timestamp');
  assert(confirmed.applicationCode.startsWith('HUHS-'), `Generated official admission application code: ${confirmed.applicationCode}`);

  const confirmedClassStats = Store.getClassSeatStats(targetClassId);
  assert(confirmedClassStats.confirmedSeats === initialConfirmed + 1, `Class confirmedSeats count incremented (${initialConfirmed} -> ${confirmedClassStats.confirmedSeats})`);
  assert(confirmedClassStats.heldSeats === 0, 'Class heldSeats count released to 0');

  // Step D: Attempt reservation after confirmation (must be blocked)
  let postConfirmCaught = false;
  try {
    const anotherClassId = classes[1].id;
    await MockApi.createHold(anotherClassId, studentA);
  } catch (err) {
    postConfirmCaught = true;
    assert((err.status === 409 || err.status === 400) && err.message.includes('already confirmed'), `Post-confirmation application blocked: ${err.message}`);
  }
  assert(postConfirmCaught === true, 'Confirmed student cannot reserve any more classes');

  // 6. Student B: Cancellation & Expiration
  console.log('\n--- 6. Cancellation & Expiration ---');
  const studentB = '20089999999990002';
  const holdB = await MockApi.createHold(classes[1].id, studentB);
  assert(holdB.status === 'HELD', 'Student B reserved a seat');

  // Cancel hold
  const cancelled = await MockApi.cancelHold(holdB.holdId, studentB);
  assert(cancelled.status === 'CANCELLED', 'Student B cancelled reservation');
  const classBAfterCancel = Store.getClassSeatStats(classes[1].id);
  assert(classBAfterCancel.heldSeats === 0, 'Cancelled hold returned seat to available pool');

  // Student B can now reserve again
  const holdB2 = await MockApi.createHold(classes[1].id, studentB);
  assert(holdB2.status === 'HELD', 'Student B can reserve again after cancellation');

  // Simulate hold expiration
  const allHolds = Store.getHolds();
  const targetHold = allHolds.find(h => h.holdId === holdB2.holdId);
  targetHold.expiresAt = new Date(Date.now() - 5000).toISOString(); // expired 5s ago
  Store.saveHolds(allHolds);

  Store.expireHolds();
  const refreshedHold = Store.getHoldById(holdB2.holdId);
  assert(refreshedHold.status === 'EXPIRED', 'Expired hold status transitioned to EXPIRED');

  console.log(`\n=== TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
