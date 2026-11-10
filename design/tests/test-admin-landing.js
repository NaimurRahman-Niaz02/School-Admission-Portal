/**
 * Unit & Integration Test Suite: Admin Panel Landing Page Requirements
 * 1. Spacing between sections
 * 2. Navbar with logo, location as student portal, and navigations in the middle
 * 3. Top section:
 *    - Remove "Academic Session 2027" and description text
 *    - Clock under bold "Admission Year 2027"
 *    - Right side has admission start date and closing dates
 *    - No time update button in this section
 * 4. Stat section:
 *    - Numbers in the middle
 *    - Subtext below numbers removed
 * 5. Activity section:
 *    - No colored headers (+, undefined, etc.)
 *    - No text below headings
 *    - Buttons named "Create", "View", "Update"
 * 6. Class list section removed from landing page
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

console.log('=== RUNNING UPDATED ADMIN PANEL LANDING PAGE TESTS ===\n');

// 1. NAVBAR TESTS
console.log('--- 1. Navbar Requirements (Logo, Location, Middle Navigations) ---');
const navHtml = Components.renderAuthorityHeader('#/authority/admission-management');

runTest('Navbar contains logo crest and location "Nagua, Sadar, Kishoregong"', () => {
  assert(navHtml.includes('brand-crest'), 'Must include brand-crest');
  assert(navHtml.includes('Hashmat Uddin High School'), 'Brand must have Hashmat Uddin High School');
  assert(navHtml.includes('brand-location'), 'Must include brand-location');
  assert(navHtml.includes('Nagua, Sadar, Kishoregong'), 'Must include Nagua, Sadar, Kishoregong');
});

runTest('Navbar page navigations are centered in the middle', () => {
  assert(navHtml.includes('authority-nav-center'), 'Must contain authority-nav-center class for middle alignment');
  assert(navHtml.includes('Dashboard'), 'Must contain Dashboard');
  assert(navHtml.includes('New Class'), 'Must contain New Class');
  assert(navHtml.includes('Statistics'), 'Must contain Statistics');
});

runTest('Navbar actions include Sign Out and Student Portal', () => {
  assert(navHtml.includes('Sign Out'), 'Must contain Sign Out');
  assert(navHtml.includes('Student Portal'), 'Must contain Student Portal');
});

// 2. HERO & LANDING PAGE STRUCTURE TESTS
console.log('\n--- 2. Top Section, Stat Boxes, Activity Section & Class List Removal ---');

(async () => {
  const container = {
    innerHTML: '',
    querySelector(sel) {
      const html = this.innerHTML;
      if (html.includes(sel.replace(/^[#.\[\]]/, '')) || sel.startsWith('#') || sel.startsWith('.')) {
        return {
          textContent: '',
          style: {},
          addEventListener() {}
        };
      }
      return null;
    }
  };

  await Pages.renderAuthorityLandingPage(container);
  const html = container.innerHTML;

  runTest('Top section: Has bold "Admission Year 2027"', () => {
    assert(html.includes('Admission Year 2027'), 'Top section heading must be Admission Year 2027');
  });

  runTest('Top section: Removed "Academic Session 2027" and description paragraph', () => {
    assert(!html.includes('Academic Session 2027'), 'Must not contain Academic Session 2027 tag');
    assert(!html.includes('Centralized administration for Session 2027 admissions'), 'Must not contain description text');
  });

  runTest('Top section: Clock is under bold heading and no update button in this section', () => {
    assert(html.includes('hero-live-clock-box'), 'Must contain live clock box under heading');
    assert(html.includes('admin-admission-clock'), 'Must contain admin countdown clock');
    assert(!html.includes('btn-quick-adjust-time'), 'Must NOT have update time button in top section');
  });

  runTest('Top section: Right side contains admission start date and closing dates', () => {
    assert(html.includes('admin-dates-panel'), 'Must contain admin-dates-panel');
    assert(html.includes('admin-hero-start-date'), 'Must have start date element');
    assert(html.includes('admin-hero-end-date'), 'Must have closing date element');
    assert(html.includes('Admission Start Date'), 'Label for start date');
    assert(html.includes('Admission Closing Date'), 'Label for closing date');
  });

  runTest('Stat section: Numbers are present and subtext below numbers is removed', () => {
    assert(html.includes('authority-landing-metrics'), 'Stat section must exist');
    assert(html.includes('hub-metric-classes'), 'Active classes metric');
    assert(html.includes('hub-metric-seats'), 'Total seat capacity metric');
    assert(html.includes('hub-metric-confirmed'), 'Admitted students metric');
    assert(html.includes('hub-metric-held'), 'Active holds metric');
    assert(html.includes('hub-metric-available'), 'Available seats metric');

    assert(!html.includes('Class 6 through 10'), 'Removed subtext Class 6 through 10');
    assert(!html.includes('Session 2027 quota'), 'Removed subtext Session 2027 quota');
    assert(!html.includes('Fee paid & confirmed'), 'Removed subtext Fee paid & confirmed');
    assert(!html.includes('10-min reservation window'), 'Removed subtext 10-min reservation window');
    assert(!html.includes('Open for applicants'), 'Removed subtext Open for applicants');
  });

  runTest('Activity section: Removed colored headings (+, undefined, etc.) and descriptions', () => {
    assert(html.includes('authority-interactive-actions'), 'Activity section must exist');
    assert(!html.includes('module-icon'), 'Must NOT contain colored module-icon headings');
    assert(!html.includes('icon-teal'), 'Must NOT contain icon-teal');
    assert(!html.includes('undefined'), 'Must NOT contain undefined');
    assert(!html.includes('module-desc'), 'Must NOT contain module-desc');
    assert(!html.includes('Set up new Class 6 to 10 sections'), 'Must NOT contain card 1 description');
    assert(!html.includes('Audit real-time enrollment percentages'), 'Must NOT contain card 2 description');
    assert(!html.includes('Adjust the admission start and closing schedule'), 'Must NOT contain card 3 description');
  });

  runTest('Activity section: Buttons are strictly named "Create", "View", and "Update"', () => {
    // Card 1: Create
    assert(html.includes('>Create<') || html.includes('>\n                    Create\n'), 'Card 1 button named Create');
    // Card 2: View
    assert(html.includes('>View<') || html.includes('>\n                    View\n'), 'Card 2 button named View');
    // Card 3: Update
    assert(html.includes('>Update<') || html.includes('>\n                    Update\n'), 'Card 3 button named Update');
  });

  runTest('Class list section is completely removed from the landing page', () => {
    assert(!html.includes('landing-classes-tbody'), 'Must NOT contain classes tbody');
    assert(!html.includes('Current Classes Quota Overview'), 'Must NOT contain classes quota overview table');
  });

  console.log(`\n=== ALL UPDATED ADMIN TESTS: ${passCount} PASSED, ${testCount - passCount} FAILED ===`);
  if (testCount - passCount > 0) {
    process.exit(1);
  }
  process.exit(0);
})();
