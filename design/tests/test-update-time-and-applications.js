/**
 * Unit & Integration Test Suite:
 * 1. Admin Panel Update Time Pop Up:
 *    - Remove intro paragraph: "Configure the official admission window for Session 2027..."
 *    - Remove "When students can begin reserving seats"
 *    - Remove "Final deadline for seat reservations and fee confirmations"
 *    - Remove quick presets component
 * 2. Student Portal My Applications & Application Details:
 *    - Remove "My Applications" text
 *    - Show ID part in the middle
 *    - Show full ID instead of mask
 *    - Global light gray background for the page
 *    - Remove "Admission Application" text
 *    - Remove "Back to Applications" button
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
      querySelector() { return null; },
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

async function main() {
  console.log('=== RUNNING UPDATE TIME MODAL & MY APPLICATIONS TESTS ===\n');

  // 1. UPDATE ADMISSION TIME MODAL
  console.log('--- 1. Admin Panel Update Time Pop Up Verification ---');
  let modalTitle = '';
  let modalContent = '';

  // Intercept openModal
  Components.openModal = function(options) {
    modalTitle = options.title;
    modalContent = options.content;
  };

  Components.showUpdateAdmissionTimeModal({
    currentTimeline: {
      startDate: '2026-11-01T08:00:00.000Z',
      endDate: '2026-11-30T23:59:59.000Z'
    }
  });

  runTest('Removed intro paragraph "Configure the official admission window..."', () => {
    assert(!modalContent.includes('Configure the official admission window for'),
      'Intro paragraph must be removed');
    assert(!modalContent.includes('Changes update all live countdown timers immediately'),
      'Intro text must not exist');
  });

  runTest('Removed "When students can begin reserving seats"', () => {
    assert(!modalContent.includes('When students can begin reserving seats'),
      'Subtext under start date must be removed');
  });

  runTest('Removed "Final deadline for seat reservations and fee confirmations"', () => {
    assert(!modalContent.includes('Final deadline for seat reservations and fee confirmations'),
      'Subtext under end date must be removed');
  });

  runTest('Removed quick presets component', () => {
    assert(!modalContent.includes('Quick Presets:'), 'Quick Presets label must be removed');
    assert(!modalContent.includes('timeline-presets-box'), 'Presets box must be removed');
    assert(!modalContent.includes('preset-open-now'), 'Preset open now button must be removed');
    assert(!modalContent.includes('preset-extend-7d'), 'Preset extend button must be removed');
    assert(!modalContent.includes('preset-default-nov'), 'Preset default button must be removed');
  });

  runTest('Start and end date inputs are present in the modal', () => {
    assert(modalContent.includes('id="timeline-start-input"'), 'Start date input must be present');
    assert(modalContent.includes('id="timeline-end-input"'), 'End date input must be present');
  });

  // 2. MY APPLICATIONS PAGE
  console.log('\n--- 2. Student Portal My Applications Page Verification ---');
  let myAppsContainerHtml = '';
  const mockMyAppsSessionCard = { innerHTML: '', querySelector() { return null; }, querySelectorAll() { return []; } };
  const mockMyAppsContentArea = { innerHTML: '', querySelector() { return null; }, querySelectorAll() { return []; } };

  const myAppsContainer = {
    set innerHTML(val) {
      myAppsContainerHtml = val;
    },
    get innerHTML() {
      return myAppsContainerHtml;
    },
    querySelector(selector) {
      if (selector === '#student-session-card') return mockMyAppsSessionCard;
      if (selector === '#applications-content-area') return mockMyAppsContentArea;
      return null;
    }
  };

  // Set active student ID
  AppState.studentId = '20081234567890001';

  await Pages.renderMyApplicationsPage(myAppsContainer);

  runTest('"My Applications" page heading text is removed', () => {
    assert(!myAppsContainerHtml.includes('class="page-title">My Applications<'),
      '"My Applications" page title text must be removed');
  });

  runTest('Student ID section is centered in the middle', () => {
    assert(myAppsContainerHtml.includes('student-session-centered-wrapper'),
      'Must contain centered wrapper for student ID');
  });

  runTest('Shows full 17-digit student ID instead of masked ID', () => {
    const sessionCardContent = mockMyAppsSessionCard.innerHTML;
    assert(sessionCardContent.includes('20081234567890001'),
      'Must display full 17-digit student ID');
    assert(!sessionCardContent.includes('•••••••••'),
      'Must not display masked ID');
  });

  runTest('Page has global light gray background (.my-applications-page-wrapper)', () => {
    assert(myAppsContainerHtml.includes('my-applications-page-wrapper'),
      'Must be wrapped in my-applications-page-wrapper with global light gray background');
    assert(!myAppsContainerHtml.includes('page-header-wrapper'),
      'Must not have separate white page-header-wrapper');
  });

  // 3. APPLICATION DETAILS PAGE
  console.log('\n--- 3. Student Portal Application Details Page Verification ---');
  let appDetailsHtml = '';
  const mockDetailsContentArea = { innerHTML: '' };

  const appDetailsContainer = {
    set innerHTML(val) {
      appDetailsHtml = val;
    },
    get innerHTML() {
      return appDetailsHtml;
    },
    querySelector(selector) {
      if (selector === '#details-content-area') return mockDetailsContentArea;
      return null;
    }
  };

  await Pages.renderApplicationDetailsPage(appDetailsContainer, 'hold_seed_001');

  runTest('"Admission Application" heading is removed', () => {
    assert(!appDetailsHtml.includes('Admission Application</h1>'),
      '"Admission Application" heading must be removed');
  });

  runTest('"Back to Applications" button is removed', () => {
    assert(!appDetailsHtml.includes('Back to Applications'),
      '"Back to Applications" button must be removed');
  });

  runTest('Application details page has global light gray background (.app-details-page-wrapper)', () => {
    assert(appDetailsHtml.includes('app-details-page-wrapper'),
      'Must be wrapped in app-details-page-wrapper');
    assert(!appDetailsHtml.includes('page-header-wrapper'),
      'Must not have separate white page-header-wrapper');
  });

  console.log(`\n=== TEST SUITE COMPLETE: ${passCount} PASSED, ${testCount - passCount} FAILED ===\n`);
  if (testCount !== passCount) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
