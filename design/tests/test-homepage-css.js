/**
 * Targeted verification test for Homepage UI and CSS updates
 */
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING HOMEPAGE CSS & UI VERIFICATION TEST ===\n');

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

// 1. Read files
const componentsJs = fs.readFileSync(path.join(__dirname, '../js/components.js'), 'utf8');
const pagesJs = fs.readFileSync(path.join(__dirname, '../js/pages.js'), 'utf8');
const componentsCss = fs.readFileSync(path.join(__dirname, '../css/components.css'), 'utf8');
const responsiveCss = fs.readFileSync(path.join(__dirname, '../css/responsive.css'), 'utf8');

// Test 1: Navbar contains "Nagua, Sadar, Kishoregong" and "Info"
console.log('--- 1. Navbar Updates ---');
assert(componentsJs.includes('Nagua, Sadar, Kishoregong'), 'Navbar includes location "Nagua, Sadar, Kishoregong" below school name');
assert(componentsJs.includes('brand-location'), 'Navbar has brand-location element');
assert(componentsJs.includes('>Info</a>'), 'Navbar has "Info" nav link instead of "Admission Information"');
assert(componentsCss.includes('.brand-location'), 'components.css defines styling for .brand-location');

// Test 2: Hero Section Left Side Content
console.log('\n--- 2. Hero Section Left-Side Texts ---');
assert(pagesJs.includes('Admission Open 2027'), 'Hero includes badge "Admission Open 2027"');
assert(pagesJs.includes('Secure Your Seat for 2027!'), 'Hero heading is "Secure Your Seat for 2027!"');
assert(pagesJs.includes('Start your journey with Hashmat Uddin High School. Secure your seat for Session 2027'), 'Hero description contains required text');
assert(pagesJs.includes('First to Apply, First to Belong'), 'Hero contains "First to Apply, First to Belong"');
assert(pagesJs.includes('hero-tagline-highlight'), 'Hero tagline is wrapped in .hero-tagline-highlight');
assert(componentsCss.includes('.hero-tagline-highlight'), 'components.css contains .hero-tagline-highlight styling (bold & highlighted)');

// Test 3: Hero Section Right Side Clock (Bright Color)
console.log('\n--- 3. Hero Section Right-Side Bright Clock ---');
assert(pagesJs.includes('hero-visual'), 'Hero visual right container exists');
const heroVisualIdx = pagesJs.indexOf('class="hero-visual"');
const heroTimerIdx = pagesJs.indexOf('id="hero-admission-timer"');
assert(heroTimerIdx > heroVisualIdx, 'Clock timer is positioned inside right side .hero-visual container');
assert(pagesJs.includes('hero-timer-bright'), 'Hero clock uses .hero-timer-bright styling class');
assert(componentsCss.includes('.hero-timer-bright'), 'components.css contains .hero-timer-bright with bright colors & shadows');

// Test 4: Section Separation Bar & Academic Section Background
console.log('\n--- 4. Section Separation Bars & Backgrounds ---');
// Hero section border-bottom should be none
const heroSectionCssMatch = componentsCss.match(/\.hero-section\s*\{([^}]+)\}/);
assert(heroSectionCssMatch && !heroSectionCssMatch[1].includes('border-bottom: 1px solid'), 'Hero section border-bottom separation bar is removed');

// Academic section background should be homepage light gray and no borders
const academicCssMatch = componentsCss.match(/\.section-featured-minimal\s*\{([^}]+)\}/);
assert(academicCssMatch && academicCssMatch[1].includes('var(--bg-app)'), 'Academic class section background is set to light gray (var(--bg-app))');
assert(academicCssMatch && !academicCssMatch[1].includes('border-top: 1px solid'), 'Academic section border-top separation bar is removed');
assert(academicCssMatch && !academicCssMatch[1].includes('border-bottom: 1px solid'), 'Academic section border-bottom separation bar is removed');

// Test 5: First-come, first-served block removed from hero
console.log('\n--- 5. First-Come First-Served Seat Block Removal ---');
assert(!pagesJs.includes('<div class="hero-highlights">'), 'Hero highlights block for first-come first-served seats is removed');

// Test 6: Academic Classes Section Middle Line Styling
console.log('\n--- 6. Academic Section Middle Line Styling ---');
assert(pagesJs.includes('academic-classes-banner'), 'Academic section contains .academic-classes-banner');
assert(pagesJs.includes('academic-chip'), 'Academic section contains .academic-chip elements');
assert(pagesJs.includes('Class 6</strong> through <strong>10'), 'Middle line highlights Class 6 through 10');
assert(pagesJs.includes('Morning</strong> &amp; <strong>Day</strong> Shifts'), 'Middle line highlights Morning & Day Shifts');
assert(pagesJs.includes('Science</strong> &bull; <strong>Arts</strong> &bull; <strong>Commerce'), 'Middle line highlights Science, Arts & Commerce');
assert(componentsCss.includes('.academic-classes-banner'), 'components.css styles .academic-classes-banner with rounded pill & shadow');
assert(componentsCss.includes('.academic-chip'), 'components.css styles .academic-chip with distinct icons & typography');
assert(responsiveCss.includes('.academic-classes-banner'), 'responsive.css includes mobile adaptation for .academic-classes-banner');

console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL HOMEPAGE CSS & UI TESTS PASSED SUCCESSFULLY!');
}

