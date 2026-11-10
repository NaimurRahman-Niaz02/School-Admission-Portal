/**
 * test-part3-dom-verification.mjs
 * Static and structural analysis of Part 3 Authority Portal React components
 * Hashmat Uddin High School Online Admission System
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

let passed = 0;
let total = 0;

function it(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
    throw err;
  }
}

console.log('Starting Part 3 Authority Portal DOM & Template Structure Verification...\n');

const SRC_DIR = '/home/naim/WorkSpace/Projects/assessment/OnnoRokom/HSUS/frontend/src';

// 1. Authority Verification Gate
console.log('1. Authority Verification Gate:');
const gateCode = fs.readFileSync(path.join(SRC_DIR, 'pages/authority/AuthorityVerificationGate.jsx'), 'utf-8');

it('AuthorityVerificationGate contains confidential badge, passcode input with toggle, and demo hint', () => {
  assert.ok(gateCode.includes('CONFIDENTIAL • RESTRICTED ACCESS') || gateCode.includes('RESTRICTED ACCESS'), 'Must display restricted badge');
  assert.ok(gateCode.includes('admin-passcode-input'), 'Must have admin-passcode-input');
  assert.ok(gateCode.includes('btn-toggle-password'), 'Must have password visibility toggle');
  assert.ok(gateCode.includes('admin2026'), 'Must display admin2026 demo hint');
  assert.ok(gateCode.includes('Return to Public Student Portal'), 'Must have return to public portal link');
});

// 2. Authority Dashboard Page
console.log('\n2. Authority Dashboard Page:');
const dashCode = fs.readFileSync(path.join(SRC_DIR, 'pages/authority/AuthorityDashboardPage.jsx'), 'utf-8');

it('AuthorityDashboardPage has Year 2027 heading, live clock, start/closing dates, and 5 KPI metrics', () => {
  assert.ok(dashCode.includes('Admission Year 2027'), 'Must have Admission Year 2027 title');
  assert.ok(dashCode.includes('admin-admission-clock'), 'Must have live clock with id admin-admission-clock');
  assert.ok(dashCode.includes('admin-hero-start-date'), 'Must display start date');
  assert.ok(dashCode.includes('admin-hero-end-date'), 'Must display closing date');
  assert.ok(dashCode.includes('hub-metric-classes'), 'Must display active classes count');
  assert.ok(dashCode.includes('hub-metric-seats'), 'Must display total capacity');
  assert.ok(dashCode.includes('hub-metric-confirmed'), 'Must display confirmed admissions');
  assert.ok(dashCode.includes('hub-metric-held'), 'Must display active holds');
  assert.ok(dashCode.includes('hub-metric-available'), 'Must display available seats');
});

it('AuthorityDashboardPage includes 3 interactive module cards and schedule update modal', () => {
  assert.ok(dashCode.includes('Create New Classes'), 'Must have Create New Classes module');
  assert.ok(dashCode.includes('Admission Statistics'), 'Must have Admission Statistics module');
  assert.ok(dashCode.includes('Update Admission Time'), 'Must have Update Admission Time module');
  assert.ok(dashCode.includes('UpdateAdmissionTimeModal'), 'Must integrate UpdateAdmissionTimeModal');
});

// 3. Authority Create Class Page
console.log('\n3. Authority Create Class Page:');
const createClassCode = fs.readFileSync(path.join(SRC_DIR, 'pages/authority/AuthorityCreateClassPage.jsx'), 'utf-8');

it('AuthorityCreateClassPage enforces clean 2-column grid with dynamic discipline group rules', () => {
  assert.ok(createClassCode.includes('create-class-form-grid'), 'Must use 2-column form grid');
  assert.ok(createClassCode.includes('create-page-year'), 'Must have Year 2027 select');
  assert.ok(createClassCode.includes('create-page-class'), 'Must have class select');
  assert.ok(createClassCode.includes('create-page-shift'), 'Must have shift select');
  assert.ok(createClassCode.includes('create-page-group'), 'Must have group select');
  assert.ok(createClassCode.includes('create-page-seats'), 'Must have seats input');
  assert.ok(createClassCode.includes('create-page-fee'), 'Must have fee input');
  assert.ok(createClassCode.includes('Science') && createClassCode.includes('Commerce') && createClassCode.includes('Arts'), 'Must offer 3 groups for high school');
  assert.ok(createClassCode.includes('General'), 'Must offer General group for classes 6-8');
});

it('AuthorityCreateClassPage has duplicate detection and post-creation success view', () => {
  assert.ok(createClassCode.includes('findDuplicateClass'), 'Must perform duplicate check');
  assert.ok(createClassCode.includes('create-page-general-error'), 'Must have duplicate warning container');
  assert.ok(createClassCode.includes('create-class-success-view'), 'Must have success view');
  assert.ok(createClassCode.includes('Move to Statistics Page'), 'Must have link to statistics page');
  assert.ok(createClassCode.includes('Create Another Class'), 'Must have create another button');
});

// 4. Authority Statistics Page
console.log('\n4. Authority Statistics Page:');
const statsCode = fs.readFileSync(path.join(SRC_DIR, 'pages/authority/AuthorityStatisticsPage.jsx'), 'utf-8');

it('AuthorityStatisticsPage renders estimated revenue and vertical bar chart with 3 view options', () => {
  assert.ok(statsCode.includes('Estimated Revenue'), 'Must display Estimated Revenue label');
  assert.ok(statsCode.includes('stats-chart-selector'), 'Must have stats-chart-selector dropdown');
  assert.ok(statsCode.includes('Admitted % of Total Seat (By Class)'), 'Must have option 1 (class)');
  assert.ok(statsCode.includes('Distribution Based on Shifts'), 'Must have option 2 (shift)');
  assert.ok(statsCode.includes('Discipline Groups (Class 9 &amp; 10)'), 'Must have option 3 (groups)');
  assert.ok(statsCode.includes('v-barchart-wrapper'), 'Must render vertical bar chart wrapper');
  assert.ok(statsCode.includes('v-grid-line'), 'Must render horizontal percentage gridlines');
  assert.ok(statsCode.includes('v-bar-pillar'), 'Must render bar pillar with gradient');
});

it('AuthorityStatisticsPage renders class summary cards with individual revenue and link to details', () => {
  assert.ok(statsCode.includes('authority-classes-cards-grid'), 'Must render cards grid');
  assert.ok(statsCode.includes('class-summary-card'), 'Must render class-summary-card');
  assert.ok(statsCode.includes('btn-class-details'), 'Must have Details button for each class');
});

// 5. Authority Class Details Page
console.log('\n5. Authority Class Details Page:');
const classDetailsCode = fs.readFileSync(path.join(SRC_DIR, 'pages/authority/AuthorityClassDetailsPage.jsx'), 'utf-8');

it('AuthorityClassDetailsPage displays specifications, admitted roster, reserved roster, and profile modal', () => {
  assert.ok(classDetailsCode.includes('class-detail-hero-card'), 'Must render class-detail-hero-card');
  assert.ok(classDetailsCode.includes('class-hero-matrix'), 'Must render hero quota matrix');
  assert.ok(classDetailsCode.includes('Officially Enrolled Students'), 'Must have enrolled students section');
  assert.ok(classDetailsCode.includes('Active Temporary Seat Holds'), 'Must have active temporary holds section');
  assert.ok(classDetailsCode.includes('AdminStudentDetailsModal'), 'Must integrate AdminStudentDetailsModal');
  assert.ok(classDetailsCode.includes('Student Roster Notice'), 'Must handle real API mode graceful roster notice');
});

// 6. Security and Isolation Guard
console.log('\n6. Security and Isolation Guard:');
const footerCode = fs.readFileSync(path.join(SRC_DIR, 'components/layout/PublicFooter.jsx'), 'utf-8');
const navbarCode = fs.readFileSync(path.join(SRC_DIR, 'components/layout/PublicNavbar.jsx'), 'utf-8');

it('Public Navbar and Footer NEVER expose authority routes or admin passcode', () => {
  assert.ok(!navbarCode.includes('/authority'), 'Public navbar must never link to authority portal');
  assert.ok(!navbarCode.includes('admin2026'), 'Public navbar must not contain admin passcode');
  assert.ok(!footerCode.includes('/authority'), 'Public footer must never link to authority portal');
  assert.ok(!footerCode.includes('admin2026'), 'Public footer must not contain admin passcode');
});

console.log(`\n======================================================`);
console.log(`Part 3 Component Inspection Complete: ${passed}/${total} checks passed!`);
console.log(`======================================================\n`);
