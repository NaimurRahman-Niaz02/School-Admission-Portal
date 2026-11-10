/**
 * test-admission-page.js
 * Verification tests for Admission List Page & Dedicated Admission Class Page UI Updates
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let failedTests = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failedTests++;
  }
}

console.log('=== RUNNING ADMISSION PAGE & CLASS DETAILS UI VERIFICATION TESTS ===\n');

const componentsJs = fs.readFileSync(path.join(__dirname, '../js/components.js'), 'utf-8');
const pagesJs = fs.readFileSync(path.join(__dirname, '../js/pages.js'), 'utf-8');
const componentsCss = fs.readFileSync(path.join(__dirname, '../css/components.css'), 'utf-8');
const stylesCss = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf-8');

// --- 1. Admission List Page Background & Section Separator & Heading Removal ---
console.log('--- 1. Admission List Page Background & Header Updates ---');
const classSelectionSection = pagesJs.substring(
  pagesJs.indexOf('renderClassSelectionPage(container)'),
  pagesJs.indexOf('renderPublicClassDetailsPage(container')
);

it('Admission List page is wrapped in .admission-page-wrapper', () => {
  assert(classSelectionSection.includes('admission-page-wrapper'), 'Should wrap admission page in admission-page-wrapper');
});

it('components.css defines .admission-page-wrapper with var(--bg-app) and generous padding', () => {
  assert(componentsCss.includes('.admission-page-wrapper'), 'components.css must define .admission-page-wrapper');
  assert(componentsCss.includes('var(--bg-app)'), 'admission-page-wrapper must use var(--bg-app) background');
});

it('Heading "Explore Admission Classes" is removed from Admission List Page', () => {
  assert(!classSelectionSection.includes('Explore Admission Classes'), '"Explore Admission Classes" heading must be removed from admission page');
});

// --- 2. Class Card UI Specification ---
console.log('\n--- 2. Class Card Component Structure ---');
const classCardSection = componentsJs.substring(
  componentsJs.indexOf('renderClassCard(classItem, studentState)'),
  componentsJs.indexOf('renderEmptyState(')
);

it('Card header has class name heading', () => {
  assert(classCardSection.includes('class-card-title'), 'Class card header must have title');
});

it('Card line 2 contains .card-meta-line with shift on left and group on right (only for 9 & 10)', () => {
  assert(classCardSection.includes('card-meta-line'), 'Class card must have .card-meta-line');
  assert(classCardSection.includes('card-meta-shift'), 'Must have .card-meta-shift');
  assert(classCardSection.includes('card-meta-group'), 'Must have .card-meta-group');
  assert(classCardSection.includes('isHigherGrade && displayGroup'), 'Group must only be shown for higher grades (9 & 10)');
});

it('components.css defines bold & distinct colors for .card-meta-shift and .card-meta-group', () => {
  assert(componentsCss.includes('.card-meta-shift'), 'components.css must style .card-meta-shift');
  assert(componentsCss.includes('.card-meta-group'), 'components.css must style .card-meta-group');
  assert(componentsCss.includes('#2563eb'), 'Shift must use distinct bold blue');
  assert(componentsCss.includes('#0d9488'), 'Group must use distinct bold teal');
});

it('Seat counts strictly write "Total" and "Available" (never "Available Seats")', () => {
  assert(classCardSection.includes('>Total</span>'), 'Must have Total label');
  assert(classCardSection.includes('>Available</span>'), 'Must have Available label');
  assert(!classCardSection.includes('Available Seats</span>'), 'Card must NOT write "Available Seats", strictly "Available"');
});

it('Counts CSS is styled for two-cols matrix', () => {
  assert(componentsCss.includes('.class-seat-matrix.two-cols'), 'Must have .class-seat-matrix.two-cols styles');
  assert(componentsCss.includes('.class-seat-matrix.two-cols .matrix-item.is-available'), 'Must have available highlight');
});

it('Admission fee and session row is removed from class card', () => {
  assert(!classCardSection.includes('card-fee-row'), 'Admission fee and session row must be removed from class card');
});

// --- 3. Dedicated Admission Class Details Page ---
console.log('\n--- 3. Dedicated Admission Class Details Page ---');
const classDetailSection = pagesJs.substring(
  pagesJs.indexOf('renderPublicClassDetailsPage(container'),
  pagesJs.indexOf('renderMyApplicationsPage(container)')
);

it('Top banner with badges, Class 6 heading, and "Back to All Classes" is removed', () => {
  assert(!classDetailSection.includes('class-hero-badges'), 'Top badges in class details header must be removed');
  assert(!classDetailSection.includes('Back to All Classes'), '"Back to All Classes" button must be removed');
  assert(!classDetailSection.includes('class-detail-header-row'), 'Top header row wrapper must be removed');
});

it('School name is removed from Academic Specifications', () => {
  const specsSection = classDetailSection.substring(classDetailSection.indexOf('class-specs-card'), classDetailSection.indexOf('<!-- Right Column:'));
  assert(!specsSection.includes('Hashmat Uddin High School'), 'School name must not be inside Academic Specifications');
  assert(specsSection.includes('Academic Session'), 'Must keep Academic Session');
  assert(specsSection.includes('Class / Grade'), 'Must keep Class / Grade');
  assert(specsSection.includes('Shift &amp; Hours'), 'Must keep Shift & Hours');
  assert(specsSection.includes('Discipline Group'), 'Must keep Discipline Group');
  assert(specsSection.includes('Admission Fee'), 'Must keep Admission Fee');
});

it('Clock is positioned in the right column above reservation', () => {
  const rightColumn = classDetailSection.substring(classDetailSection.indexOf('class-detail-sidebar'));
  const clockIndex = rightColumn.indexOf('class-schedule-clock-card');
  const reservationIndex = rightColumn.indexOf('sidebar-card');
  assert(clockIndex !== -1, 'Clock must be in right column sidebar');
  assert(reservationIndex !== -1, 'Reservation card must be in right column sidebar');
  assert(clockIndex < reservationIndex, 'Clock must be placed FIRST before reservation card');
});

it('Clock on details page uses bright color styling (.hero-timer-bright)', () => {
  const rightColumn = classDetailSection.substring(classDetailSection.indexOf('class-detail-sidebar'));
  assert(rightColumn.includes('class-schedule-clock-card hero-timer-bright'), 'Clock must use .hero-timer-bright styling');
  assert(componentsCss.includes('.class-schedule-clock-card.hero-timer-bright'), 'CSS must define clock styling with bright colors');
});

it('Reservation card removes all intro description and bullet notes text', () => {
  const sidebarSection = classDetailSection.substring(classDetailSection.indexOf('class-detail-sidebar'));
  assert(!sidebarSection.includes('sidebar-desc'), 'Intro paragraph description must be removed');
  assert(!sidebarSection.includes('sidebar-notes'), 'Bullet notes must be removed');
  assert(!sidebarSection.includes('Requires official 17-digit birth registration number'), 'Note text 1 must be removed');
  assert(!sidebarSection.includes('Maximum one active reservation per student'), 'Note text 2 must be removed');
  assert(!sidebarSection.includes('Unconfirmed seats release automatically'), 'Note text 3 must be removed');
});

it('Reservation card keeps student birth ID input, admission fee, and reserve button', () => {
  const sidebarSection = classDetailSection.substring(classDetailSection.indexOf('class-detail-sidebar'));
  assert(sidebarSection.includes('reservation-student-id'), 'Must have student birth ID input');
  assert(sidebarSection.includes('Student Birth Registration ID'), 'Must have Student Birth ID label');
  assert(sidebarSection.includes('reservation-fee-row'), 'Must have Admission Fee row');
  assert(sidebarSection.includes('btn-reserve-this-class'), 'Must have reserve button');
});

it('Clicking reserve does NOT show popup modal; adds spinning inside reserve button', () => {
  assert(!classDetailSection.includes('showConfirmReservationModal'), 'Must not call showConfirmReservationModal');
  assert(!classDetailSection.includes('showStudentIdentityModal'), 'Must not call showStudentIdentityModal');
  assert(classDetailSection.includes('spinner-sm'), 'Must add spinning inside reserve button');
  assert(classDetailSection.includes('Reserving...'), 'Button text must show Reserving... during processing');
  assert(classDetailSection.includes('createHold'), 'Must call createHold directly');
});

console.log(`\n=== RESULTS: ${passedTests} PASSED, ${failedTests} FAILED ===`);
if (failedTests === 0) {
  console.log('ALL ADMISSION PAGE & CLASS DETAILS UI TESTS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
