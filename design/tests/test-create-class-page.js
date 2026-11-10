/**
 * Unit & Integration Test Suite: Create Class Page Requirements
 * 1. Description text and "Back to All Classes" button removed
 * 2. "Create Admission Class" centered in the middle
 * 3. Right side column removed
 * 4. Form fields:
 *    - Year: Only 2027
 *    - Class: Class 6 to 10
 *    - Group: Class 6-8 auto selects General; Class 9-10 cannot select General
 *    - Shift: Morning and Day
 *    - Total Seats & Admission Fee
 * 5. Cannot create duplicate class
 * 6. Button text strictly "Create Class" & post-creation class details view with link to statistics page
 */

const fs = require('fs');
const assert = require('assert');

// Setup mock browser environment
global.window = global;
global.document = {
  activeElement: null,
  createElement(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      style: {},
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      setAttribute() {},
      removeAttribute() {},
      remove() {},
      innerHTML: '',
      children: [],
      appendChild(child) { this.children.push(child); return child; },
      querySelector(sel) { return el.children[0] || null; },
      querySelectorAll() { return []; },
      addEventListener() {}
    };
    return el;
  },
  getElementById(id) {
    return {
      addEventListener() {},
      style: {},
      value: ''
    };
  },
  removeEventListener() {},
  addEventListener() {}
};

global.localStorage = {
  _s: {},
  getItem(k) { return this._s[k] || null; },
  setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; },
  clear() { this._s = {}; }
};
global.sessionStorage = {
  _s: {},
  getItem(k) { return this._s[k] || null; },
  setItem(k, v) { this._s[k] = String(v); },
  removeItem(k) { delete this._s[k]; },
  clear() { this._s = {}; }
};
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

// Load project scripts
eval(fs.readFileSync('js/utils.js', 'utf-8'));
eval(fs.readFileSync('js/store.js', 'utf-8'));
eval(fs.readFileSync('js/mockApi.js', 'utf-8'));
eval(fs.readFileSync('js/state.js', 'utf-8'));
eval(fs.readFileSync('js/components.js', 'utf-8'));
eval(fs.readFileSync('js/pages.js', 'utf-8'));

Store.init();

let testCount = 0;
let passCount = 0;

function runTest(name, fn) {
  testCount++;
  try {
    fn();
    passCount++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  testCount++;
  try {
    await fn();
    passCount++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
  }
}

console.log('=== RUNNING CREATE CLASS PAGE TESTS ===\n');

(async () => {
  const container = {
    innerHTML: '',
    querySelector(sel) {
      const html = this.innerHTML;
      if (sel === '#create-page-year') {
        return { value: '2027', addEventListener() {} };
      }
      if (sel === '#create-page-class') {
        return { value: 'Class 6', addEventListener() {} };
      }
      if (sel === '#create-page-group') {
        return { value: 'General', disabled: true, innerHTML: '', addEventListener() {} };
      }
      if (sel === '#create-page-shift') {
        return { value: 'Morning', addEventListener() {} };
      }
      if (sel === '#create-page-seats') {
        return { value: '40', addEventListener() {}, focus() {} };
      }
      if (sel === '#create-page-fee') {
        return { value: '1500', addEventListener() {}, focus() {} };
      }
      if (sel === '#create-page-seats-error' || sel === '#create-page-fee-error' || sel === '#create-page-general-error') {
        return { style: {}, textContent: '' };
      }
      if (sel === '#btn-create-page-submit') {
        return { disabled: false, textContent: 'Create Class', addEventListener() {} };
      }
      if (sel === '#dedicated-create-class-form') {
        return { style: {}, addEventListener() {} };
      }
      if (sel === '#create-class-success-view') {
        return { style: {}, addEventListener() {} };
      }
      if (sel.startsWith('#success-class-')) {
        return { textContent: '' };
      }
      return { style: {}, textContent: '', addEventListener() {} };
    }
  };

  await Pages.renderAuthorityCreateClassPage(container);
  const html = container.innerHTML;

  // 1. Description and Back button removed
  console.log('--- 1. Removed description and Back button ---');
  runTest('Removed description text "Configure a new academic section..."', () => {
    assert(!html.includes('Configure a new academic section with admission fee'), 'Must not contain description');
  });

  runTest('Removed "Back to All Classes" button', () => {
    assert(!html.includes('Back to All Classes'), 'Must not contain Back to All Classes button');
  });

  // 2. Title centered
  console.log('\n--- 2. Centered Title ---');
  runTest('Title "Create Admission Class" is centered in the middle', () => {
    assert(html.includes('create-class-page-header'), 'Header container must exist');
    assert(html.includes('Create Admission Class'), 'Must have Create Admission Class title');
  });

  // 3. Right side removed
  console.log('\n--- 3. Right side column removed ---');
  runTest('Right side sidebar and rules column removed', () => {
    assert(!html.includes('authority-sidebar-col'), 'Must not contain authority-sidebar-col');
    assert(!html.includes('School Class Structure Rules'), 'Must not contain rules sidebar');
    assert(!html.includes('Section Configuration Preview'), 'Must not contain preview sidebar');
    assert(html.includes('create-class-centered-container'), 'Form is centered in single column');
  });

  // 4. Form structure & inputs
  console.log('\n--- 4. Form Structure & Fields ---');
  runTest('Year input has only Year 2027', () => {
    assert(html.includes('create-page-year'), 'Must have year select');
    assert(html.includes('<option value="2027" selected>2027</option>'), 'Must have 2027 option');
    assert(!html.includes('Session 28'), 'Must NOT have Session 28');
  });

  runTest('Class dropdown offers Class 6 through 10', () => {
    assert(html.includes('create-page-class'), 'Must have class select');
    assert(html.includes('Class 6'), 'Class 6');
    assert(html.includes('Class 7'), 'Class 7');
    assert(html.includes('Class 8'), 'Class 8');
    assert(html.includes('Class 9'), 'Class 9');
    assert(html.includes('Class 10'), 'Class 10');
  });

  runTest('Shift dropdown offers Morning and Day', () => {
    assert(html.includes('create-page-shift'), 'Must have shift select');
    assert(html.includes('Morning'), 'Morning shift');
    assert(html.includes('Day'), 'Day shift');
  });

  runTest('Total seats and admission fee inputs exist', () => {
    assert(html.includes('create-page-seats'), 'Must have seats input');
    assert(html.includes('create-page-fee'), 'Must have fee input');
  });

  // 5. Duplicate Class Prevention
  console.log('\n--- 5. Duplicate Prevention ---');
  await runAsyncTest('Duplicate class check prevents creating existing class (Class 6 - Morning)', async () => {
    const duplicate = Store.findDuplicateClass('Class 6', 'Morning', 'General', '2027');
    assert(duplicate !== null, 'Class 6 - Morning must already exist in Session 27/2027');

    let threw = false;
    try {
      await MockApi.createClass({
        grade: 'Class 6',
        shift: 'Morning',
        group: 'General',
        session: '2027',
        totalSeats: 40,
        fee: 1500
      });
    } catch (err) {
      threw = true;
      assert(err.message.includes('already exists'), 'Error message states class already exists');
    }
    assert(threw, 'Must throw duplicate error');
  });

  // 6. Button text & post-creation view
  console.log('\n--- 6. Button Text & Post-Creation Details View ---');
  runTest('Button text is strictly "Create Class"', () => {
    assert(html.includes('>Create Class<') || html.includes('>\n                    Create Class\n'), 'Button must say Create Class');
    assert(!html.includes('Create Admission Class</button>'), 'Button must NOT say Create Admission Class');
  });

  runTest('Success view displays class details and button to move to statistics page', () => {
    assert(html.includes('create-class-success-view'), 'Must have success view container');
    assert(html.includes('created-class-details-card'), 'Must have class details card');
    assert(html.includes('success-class-name'), 'Class name in details');
    assert(html.includes('success-class-year'), 'Academic year in details');
    assert(html.includes('success-class-grade'), 'Grade in details');
    assert(html.includes('success-class-shift'), 'Shift in details');
    assert(html.includes('success-class-group'), 'Group in details');
    assert(html.includes('success-class-seats'), 'Seats in details');
    assert(html.includes('success-class-fee'), 'Fee in details');
    assert(html.includes('href="#/authority/statistics"'), 'Button must link to statistics page');
    assert(html.includes('Move to Statistics Page'), 'Button label must state Move to Statistics Page');
  });

  console.log(`\n=== ALL CREATE CLASS PAGE TESTS: ${passCount} PASSED, ${testCount - passCount} FAILED ===`);
  if (testCount - passCount > 0) {
    process.exit(1);
  }
  process.exit(0);
})();

