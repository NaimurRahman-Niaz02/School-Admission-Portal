/**
 * test-part2-dom-verification.mjs
 * Static and structural analysis of Part 2 React components and templates
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

console.log('Starting Part 2 Component Structure & Visual Integrity Tests...\n');

const SRC_DIR = '/home/naim/WorkSpace/Projects/assessment/OnnoRokom/HSUS/frontend/src';

// 1. ClassCard Component Inspection
console.log('1. ClassCard Component Inspection:');
const classCardCode = fs.readFileSync(path.join(SRC_DIR, 'components/common/ClassCard.jsx'), 'utf-8');

it('ClassCard displays 4-tier seat matrix: Total, Held, Confirmed, Available', () => {
  assert.ok(classCardCode.includes('class-seat-matrix'), 'Must have class-seat-matrix container');
  assert.ok(classCardCode.includes('Total'), 'Must display Total seats');
  assert.ok(classCardCode.includes('Held'), 'Must display Held seats');
  assert.ok(classCardCode.includes('Confirmed'), 'Must display Confirmed seats');
  assert.ok(classCardCode.includes('Available'), 'Must display Available seats');
  assert.ok(classCardCode.includes('available-number'), 'Must have available-number class for styling');
});

it('ClassCard contains occupancy utilization progress bar', () => {
  assert.ok(classCardCode.includes('seat-progress-bar'), 'Must contain seat-progress-bar');
  assert.ok(classCardCode.includes('progress-segment confirmed'), 'Must contain confirmed segment');
  assert.ok(classCardCode.includes('progress-segment held'), 'Must contain held segment');
});

it('ClassCard formats shift and group correctly', () => {
  assert.ok(classCardCode.includes('card-meta-shift'), 'Must display card-meta-shift');
  assert.ok(classCardCode.includes('card-meta-group'), 'Must display card-meta-group for higher grades');
});

// 2. ClassSelectionPage Component Inspection
console.log('\n2. ClassSelectionPage Component Inspection:');
const classSelCode = fs.readFileSync(path.join(SRC_DIR, 'pages/public/ClassSelectionPage.jsx'), 'utf-8');

it('ClassSelectionPage implements search, class filter, shift filter, and clear filters', () => {
  assert.ok(classSelCode.includes('class-search-input'), 'Must have search input with id class-search-input');
  assert.ok(classSelCode.includes('grade-filter-select'), 'Must have grade filter with id grade-filter-select');
  assert.ok(classSelCode.includes('shift-filter-select'), 'Must have shift filter with id shift-filter-select');
  assert.ok(classSelCode.includes('btn-reset-filters'), 'Must have reset button');
  assert.ok(classSelCode.includes('filter-count-label'), 'Must have filter count label');
});

it('ClassSelectionPage contains student restriction banners for HELD and CONFIRMED', () => {
  assert.ok(classSelCode.includes('Your admission has already been confirmed'), 'Must warn confirmed student');
  assert.ok(classSelCode.includes('You already have an active seat reservation'), 'Must warn student with active hold');
});

it('ClassSelectionPage has automatic 5-second polling interval', () => {
  assert.ok(classSelCode.includes('setInterval(') && classSelCode.includes('5000'), 'Must poll every 5 seconds');
});

// 3. PublicClassDetailsPage Component Inspection
console.log('\n3. PublicClassDetailsPage Component Inspection:');
const classDetailsCode = fs.readFileSync(path.join(SRC_DIR, 'pages/public/PublicClassDetailsPage.jsx'), 'utf-8');

it('PublicClassDetailsPage has seat quota matrix, academic specs, and live schedule clock', () => {
  assert.ok(classDetailsCode.includes('class-counts-matrix-card'), 'Must contain seat counts matrix card');
  assert.ok(classDetailsCode.includes('stat-total-seats'), 'Must display total capacity');
  assert.ok(classDetailsCode.includes('stat-avail-seats'), 'Must display available seats');
  assert.ok(classDetailsCode.includes('stat-held-seats'), 'Must display held seats');
  assert.ok(classDetailsCode.includes('stat-confirmed-seats'), 'Must display confirmed seats');
  assert.ok(classDetailsCode.includes('class-specs-card'), 'Must contain academic specifications card');
  assert.ok(classDetailsCode.includes('class-schedule-clock-card'), 'Must contain schedule clock card');
});

it('PublicClassDetailsPage validates 17-digit student birth registration ID strictly', () => {
  assert.ok(classDetailsCode.includes('reservation-student-id'), 'Must have reservation student id input');
  assert.ok(classDetailsCode.includes('isValid17DigitId'), 'Must validate using isValid17DigitId');
  assert.ok(classDetailsCode.includes('maxLength={17}'), 'Must cap input to 17 digits');
  assert.ok(!classDetailsCode.includes('Math.random()'), 'Must never randomly generate a student ID on reservation');
});

// 4. MyApplicationsPage Component Inspection
console.log('\n4. MyApplicationsPage Component Inspection:');
const myAppsCode = fs.readFileSync(path.join(SRC_DIR, 'pages/public/MyApplicationsPage.jsx'), 'utf-8');

it('MyApplicationsPage displays centered student identity session card with change ID action', () => {
  assert.ok(myAppsCode.includes('student-session-centered-wrapper'), 'Must have centered session wrapper');
  assert.ok(myAppsCode.includes('active-student-badge'), 'Must display active student badge');
  assert.ok(myAppsCode.includes('Change ID'), 'Must have Change ID button');
});

it('MyApplicationsPage handles active admission record and historical logs with status tabs', () => {
  assert.ok(myAppsCode.includes('current-admission-section'), 'Must have active admission section');
  assert.ok(myAppsCode.includes('app-mini-countdown'), 'Must have mini countdown timer for held admission');
  assert.ok(myAppsCode.includes('history-section'), 'Must have historical applications section');
  assert.ok(myAppsCode.includes('app-history-table'), 'Must display history table');
  assert.ok(myAppsCode.includes('EXPIRED'), 'Must have Expired filter tab');
  assert.ok(myAppsCode.includes('CANCELLED'), 'Must have Cancelled filter tab');
});

// 5. ApplicationDetailsPage Component Inspection
console.log('\n5. ApplicationDetailsPage Component Inspection:');
const appDetailsCode = fs.readFileSync(path.join(SRC_DIR, 'pages/public/ApplicationDetailsPage.jsx'), 'utf-8');

it('ApplicationDetailsPage handles all 4 lifecycle states: HELD, CONFIRMED, EXPIRED, CANCELLED', () => {
  assert.ok(appDetailsCode.includes("hold.status === 'HELD'"), 'Must handle HELD status');
  assert.ok(appDetailsCode.includes("hold.status === 'CONFIRMED'"), 'Must handle CONFIRMED status');
  assert.ok(appDetailsCode.includes("hold.status === 'EXPIRED'"), 'Must handle EXPIRED status');
  assert.ok(appDetailsCode.includes("hold.status === 'CANCELLED'"), 'Must handle CANCELLED status');
});

it('ApplicationDetailsPage renders official printable admission slip in CONFIRMED state', () => {
  assert.ok(appDetailsCode.includes('admission-slip-box'), 'Must render admission-slip-box');
  assert.ok(appDetailsCode.includes('Hashmat Uddin High School'), 'Must contain school name');
  assert.ok(appDetailsCode.includes('Nagua, Sadar, Kishoreganj'), 'Must contain official school address');
  assert.ok(appDetailsCode.includes('Application Serial Code'), 'Must contain application serial code');
  assert.ok(appDetailsCode.includes('Candidate Birth Registration ID'), 'Must contain student ID');
  assert.ok(appDetailsCode.includes('Enrolled Class'), 'Must contain enrolled class');
  assert.ok(appDetailsCode.includes('Admission Fee Paid'), 'Must contain fee amount');
  assert.ok(appDetailsCode.includes('Verification QR Code'), 'Must render verification QR placeholder');
  assert.ok(appDetailsCode.includes('Reference placeholder'), 'Must have clear disclaimer that QR is a placeholder');
  assert.ok(appDetailsCode.includes('Headmaster'), 'Must render Headmaster seal block');
  assert.ok(appDetailsCode.includes('window.print()'), 'Must have print slip action');
});

it('ApplicationDetailsPage integrates PaymentModal and CancelReservationModal', () => {
  assert.ok(appDetailsCode.includes('PaymentModal'), 'Must integrate PaymentModal');
  assert.ok(appDetailsCode.includes('CancelReservationModal'), 'Must integrate CancelReservationModal');
  assert.ok(appDetailsCode.includes('btn-pay-admission'), 'Must have pay fee button');
  assert.ok(appDetailsCode.includes('btn-cancel-reservation'), 'Must have cancel reservation button');
});

console.log(`\n======================================================`);
console.log(`Part 2 Component Inspection Complete: ${passed}/${total} checks passed!`);
console.log(`======================================================\n`);

