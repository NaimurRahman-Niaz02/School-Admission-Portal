/**
 * Unit & Integration Test Suite: Class Details Page Requirements
 *
 * 1. Day Shift, Group: General, Session 27, Fee: ৳1,500:
 *    - Removed as small tags above heading
 *    - Written after heading clearly and as noticeable info of this class
 * 2. In statbox:
 *    - Remove utilization
 *    - Add revenue
 * 3. Table subtitle instruction lines removed:
 *    - "Click on any candidate row to view detailed admission record" removed
 *    - "Click on any candidate row to inspect expiration timers and details" removed
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
  console.log('=== RUNNING CLASS DETAILS PAGE TESTS ===\n');

  let containerHtml = '';
  let contentAreaHtml = '';

  const mockContentArea = {
    set innerHTML(val) {
      contentAreaHtml = val;
    },
    get innerHTML() {
      return contentAreaHtml;
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {}
  };

  const mockBreadcrumb = {
    textContent: ''
  };

  const container = {
    set innerHTML(val) {
      containerHtml = val;
    },
    get innerHTML() {
      return containerHtml;
    },
    querySelector(selector) {
      if (selector === '#class-detail-content-area') return mockContentArea;
      if (selector === '#detail-breadcrumb-title') return mockBreadcrumb;
      return null;
    }
  };

  // Find a test class (e.g. class_001)
  const classes = Store.getClasses();
  const testClass = classes[0];
  assert(testClass, 'Test class must exist in seed store');

  console.log(`--- 1. Render Class Details Page for: ${testClass.name} ---`);
  await Pages.renderAuthorityClassDetailsPage(container, testClass.id);

  // Requirement 1: Small tags above heading removed; noticeable info written after heading
  console.log('\n--- 2. Class Specifications After Heading Verification ---');
  runTest('Small tags row above heading (.class-hero-badges) is removed', () => {
    assert(!contentAreaHtml.includes('class-hero-badges'), 'Small tags row must be removed');
  });

  runTest('"Back to All Classes" button is removed from class details page', () => {
    assert(!contentAreaHtml.includes('Back to All Classes'), '"Back to All Classes" button must be removed');
  });

  runTest('Noticeable info row is present after heading (.class-noticeable-meta)', () => {
    assert(contentAreaHtml.includes('class-noticeable-meta'), 'Noticeable info container must exist');
    assert(contentAreaHtml.includes('class-noticeable-item'), 'Noticeable info items must exist');
  });

  runTest('Shift is clearly written after heading', () => {
    assert(contentAreaHtml.includes('Shift:'), 'Must show Shift label');
    assert(contentAreaHtml.includes(`${testClass.shift} Shift`), 'Must show class shift value');
  });

  runTest('Group is clearly written after heading', () => {
    assert(contentAreaHtml.includes('Group:'), 'Must show Group label');
    assert(contentAreaHtml.includes(testClass.group || 'General'), 'Must show class group value');
  });

  runTest('Session is clearly written after heading', () => {
    assert(contentAreaHtml.includes('Session:'), 'Must show Session label');
    assert(contentAreaHtml.includes(testClass.session || 'Session 27'), 'Must show session value');
  });

  runTest('Fee is clearly written after heading', () => {
    assert(contentAreaHtml.includes('Fee:'), 'Must show Fee label');
    assert(contentAreaHtml.includes('৳'), 'Must show currency symbol ৳');
    assert(contentAreaHtml.includes((testClass.fee || 1500).toLocaleString()), 'Must show fee value');
  });

  // Requirement 2: In statbox, remove utilization and add revenue
  console.log('\n--- 3. Statbox Utilization Removed & Revenue Added Verification ---');
  runTest('Utilization is removed from statbox matrix', () => {
    assert(!contentAreaHtml.includes('<span class="matrix-box-label">Utilization</span>'),
      'Utilization must be removed from statbox');
  });

  runTest('Revenue is added to statbox matrix', () => {
    assert(contentAreaHtml.includes('<span class="matrix-box-label">Revenue</span>'),
      'Revenue must be added to statbox');
    assert(contentAreaHtml.includes('font-mono') && contentAreaHtml.includes('৳'),
      'Revenue value must be formatted with currency ৳');
  });

  // Requirement 3: Subtitle helper lines removed
  console.log('\n--- 4. Table Helper Subtitle Lines Removal Verification ---');
  runTest('"Click on any candidate row to view detailed admission record" is removed', () => {
    assert(!contentAreaHtml.includes('Click on any candidate row to view detailed admission record'),
      'Admitted table subtitle helper text must be removed');
  });

  runTest('"Click on any candidate row to inspect expiration timers and details" is removed', () => {
    assert(!contentAreaHtml.includes('Click on any candidate row to inspect expiration timers and details'),
      'Reserved table subtitle helper text must be removed');
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

