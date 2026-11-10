/**
 * Unit & Integration Test Suite: Admin Statistics Page Requirements
 * 1. Remove header elements:
 *    - "Admission Statistics & Analytics" title
 *    - "Institutional capacity audit, quota occupancy, shift distributions, and fee audits..." description
 *    - "Create Class" and "Classes & Rosters" buttons
 * 2. Stat boxes in a single line:
 *    - Numbers in the middle
 *    - Subtext below the numbers removed
 * 3. Remove shift and grade quota cards
 * 4. Interactive Bar Chart with selector:
 *    - Option A: Admitted % of total seat (by class, merged shifts, classes 6-10 single classes, count on bar)
 *    - Option B: Distribution based on shifts (Morning vs Day)
 *    - Option C: Three groups for Class 9 and three groups for Class 10
 * 5. Class cards instead of list:
 *    - Card holds class, shift, group, fee
 *    - Stat box has total seat, admitted, held, available, revenue
 *    - Details button linking to class details
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

async function main() {
  console.log('=== RUNNING ADMIN STATISTICS PAGE TESTS ===\n');

  // Create mock container
  let containerHtml = '';
  let statsPageContentHtml = '';

  const mockStatsContent = {
    _listeners: {},
    addEventListener(evt, fn) {
      this._listeners[evt] = this._listeners[evt] || [];
      this._listeners[evt].push(fn);
    },
    set innerHTML(val) {
      statsPageContentHtml = val;
    },
    get innerHTML() {
      return statsPageContentHtml;
    },
    querySelector(selector) {
      if (selector === '#stats-chart-selector') {
        return mockChartSelector;
      }
      if (selector === '#stats-chart-body') {
        return mockChartBody;
      }
      return null;
    }
  };

  let chartBodyHtml = '';
  const mockChartBody = {
    set innerHTML(val) {
      chartBodyHtml = val;
    },
    get innerHTML() {
      return chartBodyHtml;
    }
  };

  const mockChartSelector = {
    value: 'class',
    _listeners: {},
    addEventListener(evt, fn) {
      this._listeners[evt] = this._listeners[evt] || [];
      this._listeners[evt].push(fn);
    },
    dispatchEvent(evtName) {
      const fns = this._listeners[evtName] || [];
      for (const fn of fns) {
        fn({ target: { value: this.value } });
      }
    }
  };

  const container = {
    set innerHTML(val) {
      containerHtml = val;
    },
    get innerHTML() {
      return containerHtml;
    },
    querySelector(selector) {
      if (selector === '#stats-page-content') {
        return mockStatsContent;
      }
      return null;
    }
  };

  console.log('--- 1. Render Admin Statistics Page ---');
  await Pages.renderAuthorityStatisticsPage(container);

  // Requirement 1: Header Elements Removal
  console.log('\n--- 2. Header Elements Removal Verification ---');
  runTest('Header title "Admission Statistics & Analytics" must be removed', () => {
    assert(!containerHtml.includes('Admission Statistics &amp; Analytics'), 'Title must not be in container HTML');
    assert(!statsPageContentHtml.includes('Admission Statistics &amp; Analytics'), 'Title must not be in stats content');
  });

  runTest('Header description paragraph must be removed', () => {
    assert(!containerHtml.includes('Institutional capacity audit, quota occupancy'), 'Description must not exist');
    assert(!statsPageContentHtml.includes('Institutional capacity audit, quota occupancy'), 'Description must not exist');
  });

  runTest('"Create Class" button removed from the header', () => {
    assert(!containerHtml.includes('href="#/authority/create-class"'), 'Create Class button removed from header');
  });

  runTest('"Classes & Rosters" button removed from the header', () => {
    assert(!containerHtml.includes('Classes &amp; Rosters'), 'Classes & Rosters button removed from header');
  });

  // Requirement 2: Stat boxes in a single line, centered, no text below numbers
  console.log('\n--- 3. Stat Boxes in a Line & Centered Verification ---');
  runTest('Stat boxes rendered inside .stats-metrics-row', () => {
    assert(statsPageContentHtml.includes('stats-metrics-row'), 'Must contain .stats-metrics-row');
  });

  runTest('Stat boxes contain Active Classes, Total Capacity, Admitted Students, Active Holds, Available Seats, Total Revenue', () => {
    assert(statsPageContentHtml.includes('Active Classes'), 'Must have Active Classes');
    assert(statsPageContentHtml.includes('Total Capacity'), 'Must have Total Capacity');
    assert(statsPageContentHtml.includes('Admitted Students'), 'Must have Admitted Students');
    assert(statsPageContentHtml.includes('Active Holds'), 'Must have Active Holds');
    assert(statsPageContentHtml.includes('Available Seats'), 'Must have Available Seats');
    assert(statsPageContentHtml.includes('Total Revenue'), 'Must have Total Revenue');
  });

  runTest('Subtext below counts is completely removed', () => {
    assert(!statsPageContentHtml.includes('metric-subtext'), 'Must not have metric-subtext elements');
    assert(!statsPageContentHtml.includes('Session 27 seats'), 'Must not have subtext "Session 27 seats"');
    assert(!statsPageContentHtml.includes('Admission fee confirmed'), 'Must not have subtext "Admission fee confirmed"');
    assert(!statsPageContentHtml.includes('Open for applicants'), 'Must not have subtext "Open for applicants"');
  });

  // Requirement 3: Remove shift and grade quotas
  console.log('\n--- 4. Shift & Grade Quotas Removal Verification ---');
  runTest('"Shift Quota Distribution" is removed', () => {
    assert(!statsPageContentHtml.includes('Shift Quota Distribution'), 'Must remove Shift Quota Distribution');
  });

  runTest('"Grade Quota Breakdown" is removed', () => {
    assert(!statsPageContentHtml.includes('Grade Quota Breakdown'), 'Must remove Grade Quota Breakdown');
  });

  // Requirement 4: Bar chart with view selector (Vertical Bars with Different Colors)
  console.log('\n--- 5. Vertical Bar Chart & Colors Verification ---');
  runTest('Selector #stats-chart-selector exists with 3 view options', () => {
    assert(statsPageContentHtml.includes('id="stats-chart-selector"'), 'Selector must exist');
    assert(statsPageContentHtml.includes('value="class"'), 'Option "class" must exist');
    assert(statsPageContentHtml.includes('value="shift"'), 'Option "shift" must exist');
    assert(statsPageContentHtml.includes('value="groups"'), 'Option "groups" must exist');
  });

  runTest('Bars are vertical (.v-barchart-bars, .v-bar-col, .v-bar-pillar with height percentage)', () => {
    assert(statsPageContentHtml.includes('v-barchart-bars'), 'Must contain vertical bar chart container');
    assert(statsPageContentHtml.includes('v-bar-col'), 'Must contain vertical bar columns');
    assert(statsPageContentHtml.includes('v-bar-pillar'), 'Must contain vertical bar pillars');
    assert(statsPageContentHtml.includes('height:'), 'Vertical bars must specify height style');
  });

  runTest('Vertical bars include different colors (gradients/color styles applied)', () => {
    assert(statsPageContentHtml.includes('linear-gradient'), 'Bars must have color gradient styles');
    assert(statsPageContentHtml.includes('box-shadow'), 'Bars must have color glow styles');
    // Verify different colors exist
    const hasBlue = statsPageContentHtml.includes('#2563eb') || statsPageContentHtml.includes('rgba(37, 99, 235');
    const hasEmerald = statsPageContentHtml.includes('#059669') || statsPageContentHtml.includes('rgba(5, 150, 105');
    const hasAmber = statsPageContentHtml.includes('#d97706') || statsPageContentHtml.includes('rgba(217, 119, 6');
    assert(hasBlue && hasEmerald && hasAmber, 'Must include distinct colors across bars');
  });

  runTest('Option 1 (Class): Merges shifts, classes 6 to 10 are single classes, count on bar', () => {
    assert(statsPageContentHtml.includes('Class 6'), 'Must include Class 6');
    assert(statsPageContentHtml.includes('Class 7'), 'Must include Class 7');
    assert(statsPageContentHtml.includes('Class 8'), 'Must include Class 8');
    assert(statsPageContentHtml.includes('Class 9'), 'Must include Class 9');
    assert(statsPageContentHtml.includes('Class 10'), 'Must include Class 10');
    assert(statsPageContentHtml.includes('barchart-track'), 'Must render bar tracks');
    assert(statsPageContentHtml.includes('Admitted'), 'Must show admitted count on bar');
  });

  runTest('Option 2 (Shift): Switching to "shift" shows Morning and Day shifts with different colors', () => {
    mockChartSelector.value = 'shift';
    mockChartSelector.dispatchEvent('change');
    assert(chartBodyHtml.includes('Morning Shift'), 'Shift view must include Morning Shift');
    assert(chartBodyHtml.includes('Day Shift'), 'Shift view must include Day Shift');
    assert(chartBodyHtml.includes('v-bar-pillar'), 'Shift view must render vertical pillars');
    assert(chartBodyHtml.includes('#d97706') || chartBodyHtml.includes('#fbbf24'), 'Morning shift has distinct warm/amber color');
    assert(chartBodyHtml.includes('#2563eb') || chartBodyHtml.includes('#38bdf8'), 'Day shift has distinct blue color');
  });

  runTest('Option 3 (Groups): Switching to "groups" shows 3 groups for Class 9 and 3 groups for Class 10 with colors', () => {
    mockChartSelector.value = 'groups';
    mockChartSelector.dispatchEvent('change');
    assert(chartBodyHtml.includes('Class 9 — Science'), 'Must include Class 9 Science');
    assert(chartBodyHtml.includes('Class 9 — Commerce'), 'Must include Class 9 Commerce');
    assert(chartBodyHtml.includes('Class 9 — Arts'), 'Must include Class 9 Arts');
    assert(chartBodyHtml.includes('Class 10 — Science'), 'Must include Class 10 Science');
    assert(chartBodyHtml.includes('Class 10 — Commerce'), 'Must include Class 10 Commerce');
    assert(chartBodyHtml.includes('Class 10 — Arts'), 'Must include Class 10 Arts');
    assert(chartBodyHtml.includes('linear-gradient'), 'Group bars have distinct gradient colors');
  });

  // Spacing Verification
  console.log('\n--- 6. Spacing Verification ---');
  runTest('Section spacing classes are applied (mb-6 on breadcrumbs, mb-8 on metrics, mb-10 on chart card, mt-10 on cards)', () => {
    assert(containerHtml.includes('stats-page-breadcrumbs') || containerHtml.includes('mb-6'), 'Breadcrumbs must have margin-bottom spacing');
    assert(statsPageContentHtml.includes('stats-metrics-row mb-8'), 'Metrics row must have mb-8 margin');
    assert(statsPageContentHtml.includes('stats-chart-card mb-10'), 'Chart card must have mb-10 margin');
    assert(statsPageContentHtml.includes('classes-cards-section mt-10 mb-12'), 'Classes section must have mt-10 and mb-12 margin');
  });

  // Requirement 5: Class cards instead of list table
  console.log('\n--- 6. Class Cards Grid Verification ---');
  runTest('Old audit table list is removed', () => {
    assert(!statsPageContentHtml.includes('class="authority-table"'), 'Table list must be removed');
  });

  runTest('Cards grid exists with .class-summary-card', () => {
    assert(statsPageContentHtml.includes('authority-classes-cards-grid'), 'Must have cards grid');
    assert(statsPageContentHtml.includes('class-summary-card'), 'Must render class summary cards');
  });

  runTest('Each card displays class, shift, group, and fee', () => {
    assert(statsPageContentHtml.includes('badge-shift'), 'Card must have shift badge');
    assert(statsPageContentHtml.includes('badge-group'), 'Card must have group badge');
    assert(statsPageContentHtml.includes('class-fee-badge'), 'Card must have fee badge');
    assert(statsPageContentHtml.includes('৳'), 'Fee badge must show currency');
  });

  runTest('Stat box in each card has Total Seats, Admitted, Held, Available, and Revenue', () => {
    assert(statsPageContentHtml.includes('class-stat-box'), 'Must have stat box');
    assert(statsPageContentHtml.includes('Total Seats'), 'Must show Total Seats');
    assert(statsPageContentHtml.includes('Admitted'), 'Must show Admitted');
    assert(statsPageContentHtml.includes('Held'), 'Must show Held');
    assert(statsPageContentHtml.includes('Available'), 'Must show Available');
    assert(statsPageContentHtml.includes('Revenue'), 'Must show Revenue');
  });

  runTest('Each card has a "Details" button linking to class details', () => {
    assert(statsPageContentHtml.includes('btn-class-details'), 'Must have details button');
    assert(statsPageContentHtml.includes('Details'), 'Button text must be Details');
    assert(statsPageContentHtml.includes('href="#/authority/classes/'), 'Button must link to class details/roster');
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
