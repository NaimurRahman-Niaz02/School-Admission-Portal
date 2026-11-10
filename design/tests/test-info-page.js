/**
 * Verification test for Admission Information Page updates
 */
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING ADMISSION INFO PAGE VERIFICATION TEST ===\n');

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

const pagesJs = fs.readFileSync(path.join(__dirname, '../js/pages.js'), 'utf8');
const componentsCss = fs.readFileSync(path.join(__dirname, '../css/components.css'), 'utf8');
const utilsJs = fs.readFileSync(path.join(__dirname, '../js/utils.js'), 'utf8');

// 1. Check header removal
console.log('--- 1. Removed Header Section ---');
assert(!pagesJs.includes('Admission Information — Session 27'), 'Page header title "Admission Information — Session 27" is removed');
assert(!pagesJs.includes('Official guidelines, eligibility criteria, class shifts, and fee structure for Hashmat Uddin High School.'), 'Page header description is removed');

// 2. Check unified background and no section separators
console.log('\n--- 2. Unified Background & No Section Separators ---');
assert(pagesJs.includes('info-page-wrapper'), 'Page uses .info-page-wrapper container');
assert(componentsCss.includes('.info-page-wrapper'), 'components.css defines .info-page-wrapper');
assert(componentsCss.includes('background-color: var(--bg-app);'), 'info-page-wrapper background is var(--bg-app)');

// 3. Check shift times section (only shift times)
console.log('\n--- 3. School Shift Times Section ---');
assert(pagesJs.includes('School Shift Times'), 'Section title is "School Shift Times"');
assert(pagesJs.includes('shift-times-grid'), 'Uses .shift-times-grid container');
assert(pagesJs.includes('07:30 AM &ndash; 12:00 PM'), 'Morning shift time displayed');
assert(pagesJs.includes('12:30 PM &ndash; 05:00 PM'), 'Day shift time displayed');
assert(!pagesJs.includes('Junior High Curriculum'), 'Old curriculum text "Junior High Curriculum" is removed');
assert(!pagesJs.includes('Secondary Disciplines'), 'Old curriculum text "Secondary Disciplines" is removed');

// 4. Check fee table columns & rows & center alignment
console.log('\n--- 4. Fee Table Columns & Rows & Center Alignment ---');
assert(!pagesJs.includes('<th>Available Shifts</th>'), '"Available Shifts" table column header is removed');
assert(!pagesJs.includes('<th>Payment Timing</th>'), '"Payment Timing" table column header is removed');
assert(pagesJs.includes('Class 9') && pagesJs.includes('Commerce') && pagesJs.includes('Arts (Humanities)'), 'Class 9 has separate Commerce and Arts rows');
assert(!pagesJs.includes('Commerce / Arts'), 'Merged "Commerce / Arts" row is removed');
assert(pagesJs.includes('Class 10') && pagesJs.includes('Commerce') && pagesJs.includes('Arts (Humanities)'), 'Class 10 has separate Commerce and Arts rows');
assert(componentsCss.includes('.fee-structure-table th') && componentsCss.includes('text-align: center;'), 'Fee table th values centered in middle');
assert(componentsCss.includes('.fee-structure-table td') && componentsCss.includes('text-align: center;'), 'Fee table td values centered in middle');

// 5. Check section spacing
console.log('\n--- 5. Section Spacing ---');
assert(componentsCss.includes('.info-section {') && componentsCss.includes('margin-bottom: var(--space-16);'), 'Generous space-16 margin between info sections');
assert(componentsCss.includes('.admission-info-banner') && componentsCss.includes('margin-bottom: var(--space-16);'), 'Generous space-16 margin below admission banner');

// 6. Check contact & helpdesk section after explore button
console.log('\n--- 6. Contact & Offline Help Desk Section ---');
const exploreBtnIdx = pagesJs.indexOf('btn-explore-classes');
const contactSectionIdx = pagesJs.indexOf('info-contact-section');
assert(contactSectionIdx > exploreBtnIdx, 'Contact section is placed after the explore button');
assert(pagesJs.includes('Admission Helpdesk &amp; Offline Support'), 'Section title is "Admission Helpdesk & Offline Support"');
assert(pagesJs.includes('Campus Visit (Offline Help)'), 'Card 1 includes in-person campus visit help');
assert(pagesJs.includes('Phone &amp; Direct Hotline'), 'Card 2 includes phone hotline support');
assert(pagesJs.includes('Office Hours &amp; Inquiries'), 'Card 3 includes office hours and email');
assert(pagesJs.includes('Nagua, Sadar, Kishoregong'), 'Includes address Nagua, Sadar, Kishoregong');
assert(utilsJs.includes('phone:'), 'phone icon added to Utils.icons');
assert(utilsJs.includes('mail:'), 'mail icon added to Utils.icons');

console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL ADMISSION INFO PAGE TESTS PASSED SUCCESSFULLY!');
}

