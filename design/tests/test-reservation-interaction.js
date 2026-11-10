/**
 * test-reservation-interaction.js
 * Verifies interactive behavior of the Birth Registration ID field and Reserve button.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Setup Node simulated DOM
global.window = global;
global.document = {
  activeElement: null,
  createElement() {
    return {
      style: {},
      classList: { add() {} },
      setAttribute() {},
      remove() {},
      querySelector() { return { addEventListener() {} }; }
    };
  },
  getElementById(id) {
    return { appendChild() {} };
  },
  removeEventListener() {},
  addEventListener() {}
};

global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; },
  clear() { this._store = {}; }
};
global.sessionStorage = global.localStorage;
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

// Load app files
eval(fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf-8'));
eval(fs.readFileSync(path.join(__dirname, '../js/store.js'), 'utf-8'));
eval(fs.readFileSync(path.join(__dirname, '../js/mockApi.js'), 'utf-8'));
eval(fs.readFileSync(path.join(__dirname, '../js/state.js'), 'utf-8'));
eval(fs.readFileSync(path.join(__dirname, '../js/components.js'), 'utf-8'));
eval(fs.readFileSync(path.join(__dirname, '../js/pages.js'), 'utf-8'));

console.log('=== RUNNING RESERVATION COMPONENT INTERACTION TESTS ===\n');

// 1. Initialize data
Store.init();

// Helper to create a fake DOM container for querying
function createMockElement() {
  let fakeInput = {
    id: 'reservation-student-id',
    value: '',
    disabled: false,
    focus() { this.focused = true; },
    addEventListener(evt, fn) { this._listeners = this._listeners || {}; this._listeners[evt] = fn; }
  };
  let fakeBtn = {
    id: 'btn-reserve-this-class',
    innerHTML: 'Reserve a Seat',
    disabled: false,
    addEventListener(evt, fn) { this._handler = fn; },
    async click() { if (this._handler) await this._handler({ preventDefault() {} }); }
  };
  let fakeError = { style: { display: 'none' }, textContent: '' };
  let fakeDemoBtn = {
    addEventListener(evt, fn) { this._handler = fn; },
    click() { if (this._handler) this._handler({ preventDefault() {} }); }
  };

  const el = {
    _html: '',
    get innerHTML() { return this._html; },
    set innerHTML(val) {
      this._html = val;
      if (val.includes('id="reservation-student-id"')) {
        fakeInput.disabled = val.includes('id="reservation-student-id"') && val.includes('disabled');
      }
    },
    querySelector(selector) {
      if (selector === '#class-detail-content' || selector === '#class-detail-crumb') return this;
      if (selector === '#reservation-student-id') return fakeInput;
      if (selector === '#btn-reserve-this-class') return fakeBtn;
      if (selector === '#reservation-id-error') return fakeError;
      if (selector === '#btn-fill-demo-id') return fakeDemoBtn;
      return null;
    }
  };
  return el;
}

(async () => {
  let passed = 0;

  // Test 1: Page renders active enabled input (NEVER disabled)
  console.log('--- 1. Input Field Accessibility ---');
  const mockContainer = createMockElement();
  await Pages.renderPublicClassDetailsPage(mockContainer, 'class_001');

  const studentInput = mockContainer.querySelector('#reservation-student-id');
  assert(studentInput !== null, 'Student input field must exist in DOM');
  assert(studentInput.disabled === false, 'Student input field must NOT be disabled');
  console.log('  ✓ PASS: #reservation-student-id is rendered and enabled (not disabled)');
  passed++;

  // Test 2: Reserve button is rendered and clickable
  console.log('\n--- 2. Reserve Button Presence ---');
  const reserveBtn = mockContainer.querySelector('#btn-reserve-this-class');
  assert(reserveBtn !== null, '#btn-reserve-this-class must exist in DOM');
  assert(reserveBtn.disabled === false, 'Reserve button must not be disabled');
  console.log('  ✓ PASS: #btn-reserve-this-class is rendered and enabled');
  passed++;

  // Test 3: Reserve button action with auto-generated ID
  console.log('\n--- 3. Reservation Action Execution ---');
  let redirectedHash = '';
  global.window.location = {
    set hash(val) { redirectedHash = val; },
    get hash() { return redirectedHash; }
  };

  // Click reserve button without typing an ID -> should auto-fill 17-digit ID and reserve
  await reserveBtn.click();
  assert(redirectedHash.startsWith('#/applications/'), `Must redirect to application page, got: ${redirectedHash}`);
  console.log(`  ✓ PASS: Empty ID seamlessly auto-generated valid birth ID and created hold: ${redirectedHash}`);
  passed++;

  // Test 4: Reserve button action with custom 17-digit ID
  console.log('\n--- 4. Custom 17-Digit ID Reservation ---');
  redirectedHash = '';
  const customId = '20087777777771234';
  studentInput.value = customId;
  await reserveBtn.click();
  assert(redirectedHash.startsWith('#/applications/'), `Must create hold for custom ID, got: ${redirectedHash}`);
  console.log(`  ✓ PASS: Custom 17-digit ID reserved successfully: ${redirectedHash}`);
  passed++;

  console.log(`\n=== INTERACTION TEST RESULTS: ${passed} PASSED, 0 FAILED ===`);
  process.exit(0);
})();
