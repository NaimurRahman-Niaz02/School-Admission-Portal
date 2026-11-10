/**
 * pages.js - Page views, layout rendering, and interactive workflows
 * Hashmat Uddin High School Admission Portal
 */

(function (window) {
  'use strict';

  // Active page interval tracking for clean unmounting
  let activePageInterval = null;
  let activeCountdownTimer = null;

  function clearActiveTimers() {
    if (activePageInterval) {
      clearInterval(activePageInterval);
      activePageInterval = null;
    }
    if (activeCountdownTimer) {
      clearInterval(activeCountdownTimer);
      activeCountdownTimer = null;
    }
  }

  const Pages = {
    clearActiveTimers,

    /* =========================================================================
     * PAGE 1: HOMEPAGE (#/)
     * ========================================================================= */
    async renderHomePage(container) {
      clearActiveTimers();

      container.innerHTML = `
        <!-- Hero Section -->
        <section class="hero-section" id="hero">
          <div class="container hero-container">
            <div class="hero-content">
              <div class="portal-badge font-bold highlight-session">
                <span class="portal-dot"></span>
                <span>Admission Open 2027</span>
              </div>
              <h1 class="hero-title">Secure Your Seat for 2027!</h1>
              <p class="hero-description">
                Start your journey with Hashmat Uddin High School. Secure your seat for Session 2027
              </p>

              <!-- Bold & Highlighted Tagline -->
              <div class="hero-tagline-highlight">
                <strong>First to Apply, First to Belong</strong>
              </div>

              <div class="hero-actions">
                <a href="#/admissions/classes" class="btn btn-primary btn-lg">
                  Explore Admission Classes ${Utils.icons.arrowRight}
                </a>
                <a href="#/admission-info" class="btn btn-outline btn-lg" id="hero-btn-learn">
                  Info
                </a>
              </div>
            </div>
            <div class="hero-visual" aria-hidden="true">
              <!-- Live Admission Schedule Clock moved to top of right side with bright styling -->
              <div class="hero-admission-timer hero-timer-bright" id="hero-admission-timer">
                <div class="timer-label-row">
                  <span class="timer-dot-pulse"></span>
                  <span class="timer-heading" id="hero-timer-title">Session 27 Admission Schedule</span>
                </div>
                <div class="timer-countdown-val font-mono" id="hero-admission-clock">Calculating schedule...</div>
                <div class="timer-subtitle text-xs" id="hero-timer-hint">First-come, first-served seat allocation active</div>
              </div>

              <div class="hero-card-stack">
                <div class="hero-preview-badge">
                  <div class="badge-icon">${Utils.icons.schoolShield}</div>
                  <div>
                    <div class="font-semibold text-white">Hashmat Uddin High School</div>
                    <div class="text-xs text-blue-200">Session 27 Enrollment</div>
                  </div>
                </div>
                <div class="hero-graphic-box">
                  <div class="visual-header">
                    <span class="visual-dot red"></span>
                    <span class="visual-dot amber"></span>
                    <span class="visual-dot green"></span>
                    <span class="visual-title font-mono">seat_allocation.live</span>
                  </div>
                  <div class="visual-body">
                    <div class="visual-row">
                      <span>Class 6 — Morning</span>
                      <span class="visual-tag green">Available</span>
                    </div>
                    <div class="visual-row">
                      <span>Class 8 — Day</span>
                      <span class="visual-tag green">Available</span>
                    </div>
                    <div class="visual-row">
                      <span>Class 9 — Science</span>
                      <span class="visual-tag amber">Limited</span>
                    </div>
                    <div class="visual-meter">
                      <div class="meter-bar" style="width: 82%"></div>
                    </div>
                    <div class="visual-caption">Live Seat Allocation System</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Admission Overview -->
        <section class="section-overview" id="overview">
          <div class="container">
            <div class="section-header text-center">
              <h2 class="section-title">Transparent &amp; Fair Admission System</h2>
            </div>

            <div class="overview-grid">
              <div class="overview-card">
                <div class="overview-icon icon-teal">${Utils.icons.checkCircle}</div>
                <h3 class="overview-title">First-Come, First-Served</h3>
                <p class="overview-desc">
                  Seat quotas are allocated strictly on a chronological first-come basis. Live availability is visible to all candidates simultaneously.
                </p>
              </div>

              <div class="overview-card">
                <div class="overview-icon icon-blue">${Utils.icons.clock}</div>
                <h3 class="overview-title">10-Minute Seat Reservation</h3>
                <p class="overview-desc">
                  When you select an available class, a seat is held exclusively for you for 10 minutes to review and finalize your admission.
                </p>
              </div>

              <div class="overview-card">
                <div class="overview-icon icon-amber">${Utils.icons.alertTriangle}</div>
                <h3 class="overview-title">Automatic Expiration</h3>
                <p class="overview-desc">
                  If the admission fee is not confirmed within the 10-minute reservation window, the held seat automatically returns to the open pool.
                </p>
              </div>

              <div class="overview-card">
                <div class="overview-icon icon-emerald">${Utils.icons.creditCard}</div>
                <h3 class="overview-title">Simulated Fee Confirmation</h3>
                <p class="overview-desc">
                  In this admission portal prototype, confirm your application through our simulated payment gateway with immediate confirmation.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Academic Classes Redesigned (Seamless background, stylized middle line) -->
        <section class="section-featured-minimal" id="academic-classes">
          <div class="container text-center">
            <h2 class="section-title">Academic Classes</h2>
            
            <!-- Stylized Middle Line -->
            <div class="academic-classes-banner">
              <div class="academic-chip chip-classes">
                <span class="chip-icon">${Utils.icons.book}</span>
                <span class="chip-text"><strong>Class 6</strong> through <strong>10</strong></span>
              </div>
              <span class="chip-separator"></span>
              <div class="academic-chip chip-shifts">
                <span class="chip-icon">${Utils.icons.clock}</span>
                <span class="chip-text"><strong>Morning</strong> &amp; <strong>Day</strong> Shifts</span>
              </div>
              <span class="chip-separator"></span>
              <div class="academic-chip chip-disciplines">
                <span class="chip-icon">${Utils.icons.checkCircle}</span>
                <span class="chip-text"><strong>Science</strong> &bull; <strong>Arts</strong> &bull; <strong>Commerce</strong></span>
              </div>
            </div>

            <div class="minimal-actions">
              <a href="#/admissions/classes" class="btn btn-primary btn-lg btn-explore-classes">
                Explore Admission Classes ${Utils.icons.arrowRight}
              </a>
            </div>
          </div>
        </section>

        <!-- How Admission Works (4-Step Visual Process) -->
        <section class="section-steps" id="how-it-works">
          <div class="container">
            <div class="section-header text-center">
              <h2 class="section-title">How Admission Works</h2>
            </div>

            <div class="steps-grid">
              <!-- Step 1 -->
              <div class="step-card">
                <div class="step-badge">1</div>
                <div class="step-icon">${Utils.icons.search}</div>
                <h3 class="step-title">Explore Classes</h3>
                <p class="step-desc">
                  Browse available grades and shifts to check real-time seat availability and quota status.
                </p>
              </div>

              <!-- Step 2 -->
              <div class="step-card">
                <div class="step-badge">2</div>
                <div class="step-icon">${Utils.icons.user}</div>
                <h3 class="step-title">Select &amp; Reserve</h3>
                <p class="step-desc">
                  Provide your 17-digit birth registration number and reserve one seat in your preferred class.
                </p>
              </div>

              <!-- Step 3 -->
              <div class="step-card">
                <div class="step-badge">3</div>
                <div class="step-icon">${Utils.icons.clock}</div>
                <h3 class="step-title">Confirm Fee in 10 Min</h3>
                <p class="step-desc">
                  Complete simulated admission payment before the 10-minute hold timer expires.
                </p>
              </div>

              <!-- Step 4 -->
              <div class="step-card">
                <div class="step-badge">4</div>
                <div class="step-icon">${Utils.icons.checkCircle}</div>
                <h3 class="step-title">Receive Confirmation</h3>
                <p class="step-desc">
                  Get your official admission confirmation code and downloadable admission confirmation slip.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Admission Guidelines -->
        <section class="section-guidelines" id="guidelines">
          <div class="container">
            <div class="guidelines-card">
              <div class="guidelines-header">
                <div class="guidelines-icon">${Utils.icons.book}</div>
                <div>
                  <h3 class="guidelines-title">Important Admission Guidelines</h3>
                </div>
              </div>
              <ul class="guidelines-list">
                <li class="guideline-item">
                  <span class="guideline-check">${Utils.icons.check}</span>
                  <div>
                    <strong>Independent Options:</strong> Each class and shift (Morning or Day) is treated as a distinct admission option with its own seat quota.
                  </div>
                </li>
                <li class="guideline-item">
                  <span class="guideline-check">${Utils.icons.check}</span>
                  <div>
                    <strong>Single Active Application Policy:</strong> A student can hold at most <strong>one active reservation</strong> or <strong>one confirmed admission</strong> across the entire school.
                  </div>
                </li>
                <li class="guideline-item">
                  <span class="guideline-check">${Utils.icons.check}</span>
                  <div>
                    <strong>Changing Reservations:</strong> If you currently have an active reservation and wish to select another class or shift, you must first cancel the existing reservation.
                  </div>
                </li>
                <li class="guideline-item">
                  <span class="guideline-check">${Utils.icons.check}</span>
                  <div>
                    <strong>Finalized Admission:</strong> Once an admission fee is confirmed, the student cannot apply to any other class or shift.
                  </div>
                </li>
                <li class="guideline-item">
                  <span class="guideline-check">${Utils.icons.check}</span>
                  <div>
                    <strong>Automated Release:</strong> Unconfirmed seat holds expire precisely at the end of the 10-minute countdown and become instantly available to other students.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Existing Applicant Section -->
        <section class="section-applicant-cta">
          <div class="container">
            <div class="applicant-cta-box">
              <div class="cta-text">
                <h3 class="cta-title">Already Applied?</h3>
              </div>
              <div class="cta-action">
                <a href="#/my-applications" class="btn btn-primary btn-lg">
                  View My Applications ${Utils.icons.arrowRight}
                </a>
              </div>
            </div>
          </div>
        </section>
      `;

      // Live Admission Schedule Clock Ticker
      const clockEl = container.querySelector('#hero-admission-clock');
      const titleEl = container.querySelector('#hero-timer-title');
      const hintEl = container.querySelector('#hero-timer-hint');

      // Admission dates for Session 27 (synchronized with global timeline)
      const currentTimeline = (typeof Store !== 'undefined' && Store.getTimeline) ? Store.getTimeline() : {
        startDate: '2026-11-01T08:00:00Z',
        endDate: '2026-11-30T23:59:59Z'
      };
      const startDate = new Date(currentTimeline.startDate).getTime();
      const endDate = new Date(currentTimeline.endDate).getTime();

      function updateHeroClock() {
        if (!clockEl) return;
        const current = Date.now();

        if (current < startDate) {
          const diff = startDate - current;
          if (titleEl) titleEl.textContent = 'Session 27 Admission Starts In:';
          clockEl.textContent = Utils.formatDhms(diff);
          if (hintEl) hintEl.textContent = 'Admissions opening soon for Class 6–10';
        } else if (current >= startDate && current <= endDate) {
          const diff = endDate - current;
          if (titleEl) titleEl.textContent = 'Session 27 Admission Closes In:';
          clockEl.textContent = Utils.formatDhms(diff);
          if (hintEl) hintEl.textContent = 'First-come, first-served allocation currently open';
        } else {
          if (titleEl) titleEl.textContent = 'Session 27 Admission Schedule';
          clockEl.textContent = 'Admission Closed for Session 27';
          if (hintEl) hintEl.textContent = 'Check back for next academic session announcements';
        }
      }

      updateHeroClock();
      activePageInterval = setInterval(updateHeroClock, 1000);
    },

    /* =========================================================================
     * PAGE: ADMISSION INFORMATION (#/admission-info)
     * ========================================================================= */
    async renderAdmissionInfoPage(container) {
      clearActiveTimers();

      container.innerHTML = `
        <div class="info-page-wrapper">
          <div class="container">
            <div class="page-breadcrumbs pt-6 mb-6">
              <a href="#/">Home</a> / <span>Info</span>
            </div>

            <!-- Session Schedule Highlight Banner -->
            <div class="admission-info-banner mb-10">
              <div class="banner-icon">${Utils.icons.clock}</div>
              <div class="banner-content">
                <h3 class="banner-title">Academic Session 2026–2027 (Session 27)</h3>
                <p class="banner-desc">
                  Online admission is conducted strictly on a <strong>chronological first-come, first-served</strong> basis. Seat reservations are secured immediately upon selecting an available class and holding for 10 minutes.
                </p>
              </div>
              <div class="banner-action">
                <div class="banner-dates">
                  <span class="text-xs text-muted">Admission Timeline</span>
                  <span class="font-bold text-primary">Nov 01, 2026 — Nov 30, 2026</span>
                </div>
              </div>
            </div>

            <!-- School Shift Times Section (Shift times only) -->
            <div class="info-section mb-10">
              <h2 class="section-title text-center">School Shift Times</h2>
              <div class="shift-times-grid">
                <!-- Morning Shift -->
                <div class="shift-time-card shift-morning-card">
                  <div class="shift-card-header">
                    <div class="shift-icon-box icon-morning">
                      ${Utils.icons.clock}
                    </div>
                    <div>
                      <span class="shift-badge badge-morning">Morning Shift</span>
                      <h3 class="shift-name">Morning Shift</h3>
                    </div>
                  </div>
                  <div class="shift-card-time font-mono">
                    07:30 AM &ndash; 12:00 PM
                  </div>
                  <div class="shift-card-info">
                    <span class="shift-info-item"><strong>Applicable:</strong> Class 6 through Class 10</span>
                    <span class="shift-info-item"><strong>Assembly:</strong> 07:15 AM</span>
                  </div>
                </div>

                <!-- Day Shift -->
                <div class="shift-time-card shift-day-card">
                  <div class="shift-card-header">
                    <div class="shift-icon-box icon-day">
                      ${Utils.icons.clock}
                    </div>
                    <div>
                      <span class="shift-badge badge-day">Day Shift</span>
                      <h3 class="shift-name">Day Shift</h3>
                    </div>
                  </div>
                  <div class="shift-card-time font-mono">
                    12:30 PM &ndash; 05:00 PM
                  </div>
                  <div class="shift-card-info">
                    <span class="shift-info-item"><strong>Applicable:</strong> Class 6 through Class 10</span>
                    <span class="shift-info-item"><strong>Assembly:</strong> 12:15 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Official Fee Structure (Centered columns, Commerce & Arts separated) -->
            <div class="info-section">
              <h2 class="section-title text-center">Official Fee Structure</h2>
              <div class="table-responsive info-fee-table-card">
                <table class="authority-table fee-structure-table">
                  <thead>
                    <tr>
                      <th class="text-center">Grade / Class</th>
                      <th class="text-center">Curriculum / Group</th>
                      <th class="text-center">Admission Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="font-bold text-primary text-center">Class 6</td>
                      <td class="text-center">General</td>
                      <td class="font-bold text-emerald font-mono text-center">৳1,500</td>
                    </tr>
                    <tr>
                      <td class="font-bold text-primary text-center">Class 7</td>
                      <td class="text-center">General</td>
                      <td class="font-bold text-emerald font-mono text-center">৳1,500</td>
                    </tr>
                    <tr>
                      <td class="font-bold text-primary text-center">Class 8</td>
                      <td class="text-center">General</td>
                      <td class="font-bold text-emerald font-mono text-center">৳1,500</td>
                    </tr>
                    <tr>
                      <td class="font-bold text-primary text-center">Class 9</td>
                      <td class="text-center"><span class="text-teal font-semibold">Science</span></td>
                      <td class="font-bold text-emerald font-mono text-center">৳1,800</td>
                    </tr>
                    <tr>
                      <td class="font-bold text-primary text-center">Class 9</td>
                      <td class="text-center"><span class="font-semibold">Commerce</span></td>
                      <td class="font-bold text-emerald font-mono text-center">৳1,700</td>
                    </tr>
                    <tr>
                      <td class="font-bold text-primary text-center">Class 9</td>
                      <td class="text-center"><span class="font-semibold">Arts (Humanities)</span></td>
                      <td class="font-bold text-emerald font-mono text-center">৳1,700</td>
                    </tr>
                    <tr>
                      <td class="font-bold text-primary text-center">Class 10</td>
                      <td class="text-center"><span class="text-teal font-semibold">Science</span></td>
                      <td class="font-bold text-emerald font-mono text-center">৳1,800</td>
                    </tr>
                    <tr>
                      <td class="font-bold text-primary text-center">Class 10</td>
                      <td class="text-center"><span class="font-semibold">Commerce</span></td>
                      <td class="font-bold text-emerald font-mono text-center">৳1,700</td>
                    </tr>
                    <tr>
                      <td class="font-bold text-primary text-center">Class 10</td>
                      <td class="text-center"><span class="font-semibold">Arts (Humanities)</span></td>
                      <td class="font-bold text-emerald font-mono text-center">৳1,700</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Requirements & Rules -->
            <div class="info-section">
              <h2 class="section-title text-center">Candidate Requirements</h2>
              <div class="guidelines-card">
                <ul class="guidelines-list">
                  <li class="guideline-item">
                    <span class="guideline-check">${Utils.icons.check}</span>
                    <div>
                      <strong>17-Digit Birth Registration Number:</strong> Each applicant must provide an official, government-issued 17-digit birth registration number.
                    </div>
                  </li>
                  <li class="guideline-item">
                    <span class="guideline-check">${Utils.icons.check}</span>
                    <div>
                      <strong>Single Reservation Policy:</strong> Only one active reservation or one confirmed admission is allowed per student across Hashmat Uddin High School.
                    </div>
                  </li>
                  <li class="guideline-item">
                    <span class="guideline-check">${Utils.icons.check}</span>
                    <div>
                      <strong>10-Minute Hold Window:</strong> A reserved seat is protected for precisely 10 minutes. Complete the simulated fee payment before timer expiration to confirm enrollment.
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Explore Classes CTA Button -->
            <div class="text-center info-cta-wrapper">
              <a href="#/admissions/classes" class="btn btn-primary btn-lg btn-explore-classes">
                Explore Available Classes &amp; Reserve Seat ${Utils.icons.arrowRight}
              </a>
            </div>

            <!-- Admission Helpdesk & Contact Section (Offline, Phone, In-Person Help) -->
            <div class="info-section info-contact-section">
              <h2 class="section-title text-center">Admission Helpdesk &amp; Offline Support</h2>
              <p class="section-subtitle text-center mb-8">
                Need assistance with registration, prefer to apply offline, or have questions about eligibility? Our admission officers are ready to help.
              </p>
              
              <div class="contact-cards-grid">
                <!-- Card 1: Physical Campus Helpdesk -->
                <div class="contact-info-card">
                  <div class="contact-card-icon icon-physical">
                    ${Utils.icons.logo}
                  </div>
                  <h3 class="contact-card-title">Campus Visit (Offline Help)</h3>
                  <p class="contact-card-desc">
                    Visit our admission office in person for hands-on guidance with registration, birth certificate verification, and fee procedures.
                  </p>
                  <div class="contact-details-list">
                    <div class="contact-detail-row">
                      <span class="detail-label">Institution:</span>
                      <span class="detail-value font-semibold">Hashmat Uddin High School</span>
                    </div>
                    <div class="contact-detail-row">
                      <span class="detail-label">Location:</span>
                      <span class="detail-value">Nagua, Sadar, Kishoregong</span>
                    </div>
                    <div class="contact-detail-row">
                      <span class="detail-label">Help Desk:</span>
                      <span class="detail-value">Room 102, Ground Floor</span>
                    </div>
                  </div>
                </div>

                <!-- Card 2: Phone Hotline -->
                <div class="contact-info-card">
                  <div class="contact-card-icon icon-phone">
                    ${Utils.icons.phone}
                  </div>
                  <h3 class="contact-card-title">Phone &amp; Direct Hotline</h3>
                  <p class="contact-card-desc">
                    Call our admission support staff directly for inquiries on class availability, shifts, or submission status.
                  </p>
                  <div class="contact-details-list">
                    <div class="contact-detail-row">
                      <span class="detail-label">Helpline 1:</span>
                      <a href="tel:+8801711000000" class="detail-value font-mono font-bold text-primary">+880 1711-000000</a>
                    </div>
                    <div class="contact-detail-row">
                      <span class="detail-label">Helpline 2:</span>
                      <a href="tel:+8801811000000" class="detail-value font-mono font-bold text-primary">+880 1811-000000</a>
                    </div>
                    <div class="contact-detail-row">
                      <span class="detail-label">WhatsApp:</span>
                      <span class="detail-value font-mono">+880 1711-000000</span>
                    </div>
                  </div>
                </div>

                <!-- Card 3: Office Hours & Email -->
                <div class="contact-info-card">
                  <div class="contact-card-icon icon-hours">
                    ${Utils.icons.clock}
                  </div>
                  <h3 class="contact-card-title">Office Hours &amp; Inquiries</h3>
                  <p class="contact-card-desc">
                    Our on-campus desk operates during standard school hours. You can also contact us via email.
                  </p>
                  <div class="contact-details-list">
                    <div class="contact-detail-row">
                      <span class="detail-label">Days:</span>
                      <span class="detail-value font-semibold">Sunday &ndash; Thursday</span>
                    </div>
                    <div class="contact-detail-row">
                      <span class="detail-label">Hours:</span>
                      <span class="detail-value font-semibold">08:30 AM &ndash; 03:30 PM</span>
                    </div>
                    <div class="contact-detail-row">
                      <span class="detail-label">Email:</span>
                      <a href="mailto:admissions@hashmatuddin.edu.bd" class="detail-value text-primary">admissions@hashmatuddin.edu.bd</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;
    },

    /* =========================================================================
     * PAGE 2: CLASS SELECTION (#/admissions/classes)
     * ========================================================================= */
    async renderClassSelectionPage(container) {
      clearActiveTimers();

      let currentSearch = '';
      let currentGradeFilter = 'ALL';
      let currentShiftFilter = 'ALL';
      let cachedClasses = [];

      container.innerHTML = `
        <div class="admission-page-wrapper">
          <div class="container">
            <div class="admission-breadcrumbs mb-4">
              <a href="#/">Home</a> <span class="breadcrumb-separator">/</span> <span class="breadcrumb-current">Admission Classes</span>
            </div>

            <!-- Student Application Restriction Banner Container -->
            <div id="student-restriction-banner" class="mb-4"></div>

            <!-- Search & Filter Controls: Filter by Class and Shift only -->
            <div class="filter-bar-card mb-6">
              <div class="filter-controls-row">
                <!-- Search Input -->
                <div class="filter-search-col">
                  <div class="search-input-wrapper">
                    <span class="search-icon">${Utils.icons.search}</span>
                    <input
                      type="text"
                      id="class-search-input"
                      class="form-control search-input"
                      placeholder="Search classes or groups (e.g. Class 6, Science)..."
                      value=""
                    />
                    <button type="button" id="search-clear-btn" class="search-clear" style="display: none;" aria-label="Clear search">
                      ${Utils.icons.close}
                    </button>
                  </div>
                </div>

                <!-- Class / Grade Filter -->
                <div class="filter-select-col">
                  <label for="grade-filter-select" class="sr-only">Filter by Class</label>
                  <div class="select-wrapper">
                    <span class="select-icon">${Utils.icons.book}</span>
                    <select id="grade-filter-select" class="form-control form-select">
                      <option value="ALL">All Classes (6–10)</option>
                      <option value="Class 6">Class 6</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 9">Class 9</option>
                      <option value="Class 10">Class 10</option>
                    </select>
                  </div>
                </div>

                <!-- Shift Filter -->
                <div class="filter-select-col">
                  <label for="shift-filter-select" class="sr-only">Filter by Shift</label>
                  <div class="select-wrapper">
                    <span class="select-icon">${Utils.icons.filter}</span>
                    <select id="shift-filter-select" class="form-control form-select">
                      <option value="ALL">All Shifts</option>
                      <option value="Morning">Morning Shift</option>
                      <option value="Day">Day Shift</option>
                    </select>
                  </div>
                </div>

                <!-- Reset Action -->
                <div class="filter-action-col">
                  <button type="button" id="btn-reset-filters" class="btn btn-secondary btn-reset-filters" title="Reset all filters">
                    Clear Filters
                  </button>
                </div>
              </div>

              <div class="filter-results-meta">
                <span id="filter-count-label" class="text-muted text-sm">Showing all classes</span>
              </div>
            </div>

            <!-- Class Cards Grid Container -->
            <div id="class-cards-grid" class="class-cards-grid">
              ${Components.renderClassSkeletons(6)}
            </div>
          </div>
        </div>
      `;

      const gridEl = container.querySelector('#class-cards-grid');
      const searchInput = container.querySelector('#class-search-input');
      const searchClearBtn = container.querySelector('#search-clear-btn');
      const gradeSelect = container.querySelector('#grade-filter-select');
      const shiftSelect = container.querySelector('#shift-filter-select');
      const resetBtn = container.querySelector('#btn-reset-filters');
      const countLabel = container.querySelector('#filter-count-label');
      const restrictionBannerEl = container.querySelector('#student-restriction-banner');

      // Update Restriction Banner based on AppState
      function updateRestrictionBanner() {
        if (!restrictionBannerEl) return;
        const state = AppState.getSnapshot();

        if (state.admissionState === 'CONFIRMED' && state.currentApplication) {
          restrictionBannerEl.innerHTML = `
            <div class="alert alert-success">
              <div class="alert-icon">${Utils.icons.checkCircle}</div>
              <div class="alert-body">
                <div>
                  <strong>Your admission has already been confirmed</strong> in 
                  <span class="font-semibold">${Utils.escapeHtml(state.currentApplication.className)}</span> 
                  (Application Code: <code>${Utils.escapeHtml(state.currentApplication.applicationCode || state.currentApplication.holdId)}</code>).
                </div>
                <div class="alert-subtext">
                  Per Hashmat Uddin High School policy, confirmed students cannot apply to another class or shift.
                </div>
              </div>
              <div class="alert-actions">
                <a href="#/applications/${state.currentApplication.holdId}" class="btn btn-sm btn-outline">
                  View Confirmed Admission
                </a>
              </div>
            </div>
          `;
        } else if (state.admissionState === 'HELD' && state.currentApplication) {
          const remSec = state.currentApplication.remainingSeconds || 0;
          restrictionBannerEl.innerHTML = `
            <div class="alert alert-warning">
              <div class="alert-icon">${Utils.icons.alertTriangle}</div>
              <div class="alert-body">
                <div>
                  <strong>You already have an active seat reservation</strong> in 
                  <span class="font-semibold">${Utils.escapeHtml(state.currentApplication.className)}</span>.
                </div>
                <div class="alert-subtext">
                  You must confirm or cancel your active reservation before selecting a different class or shift.
                </div>
              </div>
              <div class="alert-actions">
                <a href="#/applications/${state.currentApplication.holdId}" class="btn btn-sm btn-primary">
                  View Current Reservation (${remSec > 0 ? Utils.formatTimeRemaining(remSec) : 'Active'})
                </a>
              </div>
            </div>
          `;
        } else {
          restrictionBannerEl.innerHTML = '';
        }
      }

      // Filter classes helper
      function getFilteredClasses() {
        return cachedClasses.filter(c => {
          // Search filter
          if (currentSearch) {
            const query = currentSearch.toLowerCase();
            const nameMatch = (c.name || '').toLowerCase().includes(query);
            const groupMatch = (c.group || '').toLowerCase().includes(query);
            if (!nameMatch && !groupMatch) return false;
          }

          // Grade filter
          if (currentGradeFilter !== 'ALL') {
            if (c.grade !== currentGradeFilter) return false;
          }

          // Shift filter
          if (currentShiftFilter !== 'ALL') {
            const shiftVal = (c.shift || (/day/i.test(c.name) ? 'Day' : 'Morning'));
            if (shiftVal.toLowerCase() !== currentShiftFilter.toLowerCase()) return false;
          }

          return true;
        });
      }

      // Render cards in grid
      function renderGrid() {
        const filtered = getFilteredClasses();
        const studentState = AppState.getSnapshot();

        if (countLabel) {
          countLabel.textContent = `Showing ${filtered.length} of ${cachedClasses.length} classes`;
        }

        if (!filtered.length) {
          gridEl.innerHTML = Components.renderEmptyState({
            icon: Utils.icons.search,
            title: 'No Matching Classes Found',
            description: 'Try adjusting your search query or removing the filters.',
            actionText: 'Reset Filters',
            actionId: 'empty-reset-filters-btn'
          });

          const emptyResetBtn = gridEl.querySelector('#empty-reset-filters-btn');
          if (emptyResetBtn) {
            emptyResetBtn.addEventListener('click', (e) => {
              e.preventDefault();
              resetFilters();
            });
          }
          return;
        }

        // Render cards
        gridEl.innerHTML = filtered.map(classItem => {
          return Components.renderClassCard(classItem, studentState);
        }).join('');
      }

      // Silent sync classes without displaying timestamp on UI
      async function syncClasses() {
        try {
          const fresh = await MockApi.getClasses();
          cachedClasses = fresh;
          await AppState.refreshAdmissionState();
          updateRestrictionBanner();
          renderGrid();
        } catch (err) {
          console.error('Failed to sync classes:', err);
        }
      }

      function resetFilters() {
        currentSearch = '';
        currentGradeFilter = 'ALL';
        currentShiftFilter = 'ALL';
        if (searchInput) searchInput.value = '';
        if (searchClearBtn) searchClearBtn.style.display = 'none';
        if (gradeSelect) gradeSelect.value = 'ALL';
        if (shiftSelect) shiftSelect.value = 'ALL';
        renderGrid();
      }

      // Bind filter events
      if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce((e) => {
          currentSearch = e.target.value.trim();
          if (searchClearBtn) {
            searchClearBtn.style.display = currentSearch ? 'inline-flex' : 'none';
          }
          renderGrid();
        }, 200));
      }

      if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
          searchInput.value = '';
          currentSearch = '';
          searchClearBtn.style.display = 'none';
          renderGrid();
          searchInput.focus();
        });
      }

      if (gradeSelect) {
        gradeSelect.addEventListener('change', (e) => {
          currentGradeFilter = e.target.value;
          renderGrid();
        });
      }

      if (shiftSelect) {
        shiftSelect.addEventListener('change', (e) => {
          currentShiftFilter = e.target.value;
          renderGrid();
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
      }

      // Initial load
      await syncClasses();

      // Silent 5s background sync (without showing timestamp on UI)
      activePageInterval = setInterval(() => {
        syncClasses();
      }, 5000);
    },

    /* =========================================================================
     * PAGE: DEDICATED PUBLIC CLASS DETAILS (#/admissions/classes/:classId)
     * ========================================================================= */
    async renderPublicClassDetailsPage(container, classId) {
      clearActiveTimers();

      container.innerHTML = `
        <div class="admission-page-wrapper">
          <div class="container">
            <div class="admission-breadcrumbs mb-4">
              <a href="#/">Home</a> <span class="breadcrumb-separator">/</span>
              <a href="#/admissions/classes">Admission Classes</a> <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-current" id="class-detail-crumb">Class Details</span>
            </div>
            <div id="class-detail-content">
              <div class="skeleton-line" style="width: 100%; height: 320px;"></div>
            </div>
          </div>
        </div>
      `;

      const crumbEl = container.querySelector('#class-detail-crumb');
      const contentEl = container.querySelector('#class-detail-content');

      try {
        const classItem = Store.getClassSeatStats(classId);
        if (!classItem) {
          contentEl.innerHTML = Components.renderEmptyState({
            icon: Utils.icons.alertTriangle,
            title: 'Class Not Found',
            description: `We could not locate admission class "${classId}".`,
            actionText: 'Back to Classes',
            actionHref: '#/admissions/classes'
          });
          return;
        }

        if (crumbEl) crumbEl.textContent = classItem.name;

        const isHigherGrade = classItem.grade === 'Class 9' || classItem.grade === 'Class 10';
        const isFull = classItem.availableSeats <= 0;

        // Status label & pill
        let statusPill = `<span class="availability-pill pill-available"><span class="pill-dot"></span> Available</span>`;
        if (isFull) {
          statusPill = `<span class="availability-pill pill-full"><span class="pill-dot"></span> Class Full</span>`;
        } else if (classItem.status === 'Limited Seats') {
          statusPill = `<span class="availability-pill pill-limited"><span class="pill-dot"></span> Limited Seats</span>`;
        }

        // Live Admission Time Clock for this class
        const now = Date.now();
        const startDate = new Date(classItem.admissionStartDate || '2026-11-01T08:00:00Z').getTime();
        const endDate = new Date(classItem.admissionEndDate || '2026-11-30T23:59:59Z').getTime();

        let timerTitle = 'Session 27 Admission Schedule';
        let timerVal = 'Loading...';
        let timerHint = '';

        if (now < startDate) {
          timerTitle = 'Admission Starts In:';
          timerVal = Utils.formatDhms(startDate - now);
          timerHint = 'Seat reservation opens when timer hits zero';
        } else if (now >= startDate && now <= endDate) {
          timerTitle = 'Admission Open &bull; Closes In:';
          timerVal = Utils.formatDhms(endDate - now);
          timerHint = 'First-come, first-served allocation currently in progress';
        } else {
          timerTitle = 'Admission Closed';
          timerVal = 'Application window closed';
          timerHint = 'Session 27 seat allocation is finished';
        }

        const initialStudentId = AppState.studentId || '';

        contentEl.innerHTML = `
          <div class="public-class-detail-grid">
            <!-- Left Column: Specs, Counts, Capacity -->
            <div class="class-detail-main">
              <!-- Seat Counts Matrix (Total, Available, Held, Confirmed) -->
              <div class="class-counts-matrix-card mb-6">
                <h3 class="counts-title">Seat Availability Breakdown</h3>
                <div class="counts-grid-four">
                  <div class="count-box">
                    <span class="count-lbl">Total Capacity</span>
                    <span class="count-num font-bold" id="stat-total-seats">${classItem.totalSeats}</span>
                    <span class="count-sub">Total Seats</span>
                  </div>
                  <div class="count-box highlight-emerald">
                    <span class="count-lbl">Available Seats</span>
                    <span class="count-num text-emerald font-bold" id="stat-avail-seats">${classItem.availableSeats}</span>
                    <span class="count-sub">Open for Hold</span>
                  </div>
                  <div class="count-box highlight-amber">
                    <span class="count-lbl">Currently Held</span>
                    <span class="count-num text-amber font-bold" id="stat-held-seats">${classItem.heldSeats}</span>
                    <span class="count-sub">10-Min Hold</span>
                  </div>
                  <div class="count-box highlight-teal">
                    <span class="count-lbl">Admitted</span>
                    <span class="count-num text-teal font-bold" id="stat-confirmed-seats">${classItem.confirmedSeats}</span>
                    <span class="count-sub">Confirmed Fee</span>
                  </div>
                </div>

                <!-- Visual Progress Meter -->
                <div class="seat-progress-bar mt-4" style="height: 10px;">
                  <div class="progress-segment confirmed" id="progress-confirmed-seg" style="width: ${classItem.totalSeats > 0 ? (classItem.confirmedSeats / classItem.totalSeats) * 100 : 0}%"></div>
                  <div class="progress-segment held" id="progress-held-seg" style="width: ${classItem.totalSeats > 0 ? (classItem.heldSeats / classItem.totalSeats) * 100 : 0}%"></div>
                </div>
                <div class="seat-progress-legend mt-2 flex-between text-xs text-muted">
                  <span id="stat-legend-avail">${classItem.availableSeats} seats open</span>
                  <span id="stat-legend-occupied">${classItem.occupancyRate}% quota occupied</span>
                </div>
              </div>

              <!-- Institutional Specifications: Session, Class, Shift, Group, Fee (School removed) -->
              <div class="class-specs-card">
                <h3 class="specs-title">Academic Specifications</h3>
                <div class="specs-list-grid">
                  <div class="spec-row">
                    <span class="spec-lbl">Academic Session</span>
                    <span class="spec-txt font-semibold">${Utils.escapeHtml(classItem.session || 'Session 27')}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-lbl">Class / Grade</span>
                    <span class="spec-txt font-semibold">${Utils.escapeHtml(classItem.grade)}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-lbl">Shift &amp; Hours</span>
                    <span class="spec-txt font-semibold">
                      ${Utils.escapeHtml(classItem.shift || 'Morning')} Shift (${classItem.shift === 'Day' ? '12:30 PM &ndash; 05:00 PM' : '07:30 AM &ndash; 12:00 PM'})
                    </span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-lbl">Discipline Group</span>
                    <span class="spec-txt font-semibold">${Utils.escapeHtml(classItem.group || (isHigherGrade ? 'Science' : 'General'))}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-lbl">Admission Fee</span>
                    <span class="spec-txt font-bold text-emerald font-mono">৳${(classItem.fee || 1500).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: First Clock with bright color, Then Reservation -->
            <div class="class-detail-sidebar">
              <div class="reservation-box-sticky">
                <!-- 1. Live Admission Clock (Top of Right Side, Bright Color) -->
                <div class="class-schedule-clock-card hero-timer-bright mb-6">
                  <div class="timer-label-row flex-between align-center">
                    <div class="flex-align-center gap-2">
                      <span class="timer-dot-pulse"></span>
                      <span class="timer-heading" id="class-clock-title">${timerTitle}</span>
                    </div>
                    <span id="class-clock-pill">${statusPill}</span>
                  </div>
                  <div class="timer-countdown-val font-mono" id="class-live-clock">${timerVal}</div>
                  <div class="timer-subtitle" id="class-clock-hint">${timerHint}</div>
                </div>

                <!-- 2. Reservation Card: Only student birth ID, admission fee, and reserve button -->
                <div class="sidebar-card">
                  <h3 class="sidebar-title mb-4">Seat Reservation</h3>

                  <div class="reservation-form-group mb-4">
                    <div class="flex-between align-center mb-1">
                      <label for="reservation-student-id" class="form-label font-semibold mb-0">
                        Student Birth Registration ID
                      </label>
                      <button type="button" class="btn-text-sm" id="btn-fill-demo-id" title="Auto-fill sample 17-digit ID">
                        Use Sample ID
                      </button>
                    </div>
                    <div class="input-with-icon">
                      <span class="input-icon">${Utils.icons.user}</span>
                      <input
                        type="text"
                        id="reservation-student-id"
                        class="form-control font-mono"
                        placeholder="Enter 17-digit Birth ID"
                        maxlength="17"
                        value="${Utils.escapeHtml(initialStudentId)}"
                        autocomplete="off"
                        inputmode="numeric"
                      />
                    </div>
                    <div id="reservation-id-error" class="reservation-error-text mt-2" style="display: none;"></div>
                  </div>

                  <div class="reservation-fee-row mb-4 flex-between align-baseline">
                    <span class="fee-lbl font-semibold">Admission Fee</span>
                    <span class="fee-val text-emerald font-bold font-mono">৳${(classItem.fee || 1500).toLocaleString()}</span>
                  </div>

                  <div class="reservation-btn-wrap">
                    <button type="button" class="btn btn-primary btn-lg btn-block" id="btn-reserve-this-class">
                      Reserve a Seat ${Utils.icons.arrowRight}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

        // Live 1-second countdown ticker
        const liveClockEl = contentEl.querySelector('#class-live-clock');
        const clockTitleEl = contentEl.querySelector('#class-clock-title');

        if (activeCountdownTimer) clearInterval(activeCountdownTimer);
        activeCountdownTimer = setInterval(() => {
          if (!liveClockEl) return;
          const cur = Date.now();
          if (cur < startDate) {
            if (clockTitleEl) clockTitleEl.textContent = 'Admission Starts In:';
            liveClockEl.textContent = Utils.formatDhms(startDate - cur);
          } else if (cur >= startDate && cur <= endDate) {
            if (clockTitleEl) clockTitleEl.textContent = 'Admission Open &bull; Closes In:';
            liveClockEl.textContent = Utils.formatDhms(endDate - cur);
          } else {
            if (clockTitleEl) clockTitleEl.textContent = 'Admission Closed';
            liveClockEl.textContent = 'Application window closed';
          }
        }, 1000);

        // Bind interactive elements
        const reserveBtn = contentEl.querySelector('#btn-reserve-this-class');
        const studentIdInput = contentEl.querySelector('#reservation-student-id');
        const errorEl = contentEl.querySelector('#reservation-id-error');
        const demoBtn = contentEl.querySelector('#btn-fill-demo-id');

        // Sample ID auto-fill button
        if (demoBtn && studentIdInput) {
          demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const demoId = '2008' + String(Date.now()).slice(-9) + '1234';
            studentIdInput.value = demoId;
            if (errorEl) {
              errorEl.style.display = 'none';
              errorEl.textContent = '';
            }
            studentIdInput.focus();
          });
        }

        // Enter key inside input submits reservation
        if (studentIdInput && reserveBtn) {
          studentIdInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              reserveBtn.click();
            }
          });
        }

        // Reserve Button Click Handler
        if (reserveBtn) {
          reserveBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (errorEl) {
              errorEl.style.display = 'none';
              errorEl.textContent = '';
            }

            try {
              let rawId = (studentIdInput ? studentIdInput.value : (AppState.studentId || '')).trim();

              // If empty, auto-generate a fresh 17-digit ID for effortless instant reservation
              if (!rawId) {
                rawId = '2008' + String(Date.now()).slice(-9) + String(Math.floor(1000 + Math.random() * 9000));
                if (studentIdInput) studentIdInput.value = rawId;
              }

              if (!Utils.isValid17DigitId(rawId)) {
                if (errorEl) {
                  errorEl.textContent = 'Please enter a valid 17-digit birth registration number (digits only).';
                  errorEl.style.display = 'block';
                }
                if (studentIdInput) studentIdInput.focus();
                return;
              }

              // Persist student ID immediately
              await AppState.setStudentId(rawId);

              // Check student admission restrictions
              const summary = await MockApi.getStudentAdmissionSummary(rawId);
              if (!summary.canApply) {
                if (summary.admissionState === 'CONFIRMED') {
                  if (errorEl) {
                    errorEl.textContent = `Admission is already confirmed for this student in ${summary.currentApplication.className}.`;
                    errorEl.style.display = 'block';
                  }
                  Components.showToast(`Admission already confirmed in ${summary.currentApplication.className}.`, 'error');
                  return;
                }
                if (summary.admissionState === 'HELD') {
                  if (summary.currentApplication.classId === classItem.id) {
                    window.location.hash = `#/applications/${summary.currentApplication.holdId}`;
                    return;
                  } else {
                    if (errorEl) {
                      errorEl.textContent = `Active reservation already exists in ${summary.currentApplication.className}. Cancel it first to apply here.`;
                      errorEl.style.display = 'block';
                    }
                    Components.showToast(`Active reservation in ${summary.currentApplication.className}. Cancel it first.`, 'warning');
                    return;
                  }
                }
              }

              // Check class capacity
              const freshStats = Store.getClassSeatStats(classItem.id);
              if (freshStats && freshStats.availableSeats <= 0) {
                if (errorEl) {
                  errorEl.textContent = 'Sorry, this class is now full.';
                  errorEl.style.display = 'block';
                }
                return;
              }

              // Inline spinning inside reserve button
              reserveBtn.disabled = true;
              reserveBtn.innerHTML = `<span class="spinner-sm"></span> Reserving...`;

              const hold = await MockApi.createHold(classItem.id, rawId);
              await AppState.refreshAdmissionState();
              Components.showToast(`Seat reserved in ${classItem.name}!`, 'success');
              window.location.hash = `#/applications/${hold.holdId}`;
            } catch (err) {
              reserveBtn.disabled = false;
              reserveBtn.innerHTML = `Reserve a Seat ${Utils.icons.arrowRight}`;
              if (errorEl) {
                errorEl.textContent = err.message || 'Failed to initiate reservation.';
                errorEl.style.display = 'block';
              }
              Components.showToast(err.message || 'Failed to initiate reservation.', 'error');
            }
          });
        }

        // 5-second background sync updating seat stats in-place WITHOUT destroying DOM
        activePageInterval = setInterval(() => {
          try {
            const fresh = Store.getClassSeatStats(classId);
            if (!fresh) return;

            const totalEl = contentEl.querySelector('#stat-total-seats');
            const availEl = contentEl.querySelector('#stat-avail-seats');
            const heldEl = contentEl.querySelector('#stat-held-seats');
            const confEl = contentEl.querySelector('#stat-confirmed-seats');
            const confBar = contentEl.querySelector('#progress-confirmed-seg');
            const heldBar = contentEl.querySelector('#progress-held-seg');
            const legAvail = contentEl.querySelector('#stat-legend-avail');
            const legOcc = contentEl.querySelector('#stat-legend-occupied');

            if (totalEl) totalEl.textContent = fresh.totalSeats;
            if (availEl) availEl.textContent = fresh.availableSeats;
            if (heldEl) heldEl.textContent = fresh.heldSeats;
            if (confEl) confEl.textContent = fresh.confirmedSeats;

            if (confBar) confBar.style.width = fresh.totalSeats > 0 ? `${(fresh.confirmedSeats / fresh.totalSeats) * 100}%` : '0%';
            if (heldBar) heldBar.style.width = fresh.totalSeats > 0 ? `${(fresh.heldSeats / fresh.totalSeats) * 100}%` : '0%';

            if (legAvail) legAvail.textContent = `${fresh.availableSeats} seats open`;
            if (legOcc) legOcc.textContent = `${fresh.occupancyRate}% quota occupied`;
          } catch (e) {
            console.error('Seat stats in-place update error:', e);
          }
        }, 5000);

      } catch (err) {
        console.error('Error loading class details:', err);
      }
    },

    /* =========================================================================
     * PAGE 3: MY APPLICATIONS (#/my-applications)
     * ========================================================================= */
    async renderMyApplicationsPage(container) {
      clearActiveTimers();

      let currentStatusFilter = 'ALL';

      container.innerHTML = `
        <div class="my-applications-page-wrapper">
          <div class="container">
            <div class="page-breadcrumbs pt-6 mb-4">
              <a href="#/">Home</a> / <span>Applications</span>
            </div>

            <!-- Student ID Section Centered in Middle -->
            <div class="student-session-centered-wrapper mb-8">
              <div class="student-session-card" id="student-session-card">
                <!-- Injected student ID bar -->
              </div>
            </div>

            <div id="applications-content-area">
              <div class="skeleton-table">
                <div class="skeleton-line" style="width: 100%; height: 80px; margin-bottom: 16px;"></div>
                <div class="skeleton-line" style="width: 100%; height: 80px; margin-bottom: 16px;"></div>
              </div>
            </div>
          </div>
        </div>
      `;

      const sessionCardEl = container.querySelector('#student-session-card');
      const contentAreaEl = container.querySelector('#applications-content-area');

      function renderStudentBar() {
        const studentId = AppState.studentId;
        if (studentId) {
          sessionCardEl.innerHTML = `
            <div class="active-student-badge">
              <span class="badge-avatar">${Utils.icons.user}</span>
              <div>
                <div class="text-xs text-muted">Active Student ID</div>
                <div class="font-mono font-bold">${Utils.escapeHtml(studentId)}</div>
              </div>
              <button type="button" class="btn btn-outline btn-sm" id="btn-change-student-app">
                Change ID
              </button>
            </div>
          `;

          const changeBtn = sessionCardEl.querySelector('#btn-change-student-app');
          if (changeBtn) {
            changeBtn.addEventListener('click', () => {
              Components.showStudentIdentityModal({
                titleText: 'Switch Active Student ID',
                onSave: async () => {
                  renderStudentBar();
                  await loadAndRenderApplications();
                }
              });
            });
          }
        } else {
          sessionCardEl.innerHTML = `
            <button type="button" class="btn btn-primary" id="btn-enter-student-app">
              ${Utils.icons.user} Identify Student to View Applications
            </button>
          `;

          const enterBtn = sessionCardEl.querySelector('#btn-enter-student-app');
          if (enterBtn) {
            enterBtn.addEventListener('click', () => {
              Components.showStudentIdentityModal({
                titleText: 'Student Identification Required',
                onSave: async () => {
                  renderStudentBar();
                  await loadAndRenderApplications();
                }
              });
            });
          }
        }
      }

      renderStudentBar();

      async function loadAndRenderApplications() {
        const studentId = AppState.studentId;

        if (!studentId) {
          contentAreaEl.innerHTML = Components.renderEmptyState({
            icon: Utils.icons.user,
            title: 'No Student ID Configured',
            description: 'Enter your 17-digit birth registration number to view your seat reservations and admission history.',
            actionText: 'Enter Student ID',
            actionId: 'btn-empty-enter-id'
          });

          const emptyBtn = contentAreaEl.querySelector('#btn-empty-enter-id');
          if (emptyBtn) {
            emptyBtn.addEventListener('click', (e) => {
              e.preventDefault();
              Components.showStudentIdentityModal({
                onSave: async () => {
                  renderStudentBar();
                  await loadAndRenderApplications();
                }
              });
            });
          }
          return;
        }

        try {
          const holds = await MockApi.getStudentHolds(studentId);
          await AppState.refreshAdmissionState();

          if (!holds || !holds.length) {
            contentAreaEl.innerHTML = Components.renderEmptyState({
              icon: Utils.icons.book,
              title: 'No Applications Yet',
              description: 'You have not submitted any class admission reservations yet.',
              actionText: 'Explore Available Classes',
              actionHref: '#/admissions/classes'
            });
            return;
          }

          // Segregate Current Admission (HELD or CONFIRMED) vs Previous History (EXPIRED, CANCELLED)
          const now = Date.now();
          const activeHold = holds.find(h => h.status === 'HELD' && new Date(h.expiresAt).getTime() > now);
          const confirmedHold = holds.find(h => h.status === 'CONFIRMED');

          const currentAdmission = confirmedHold || activeHold || null;
          const historicalHolds = holds.filter(h => h !== currentAdmission);

          // Apply Filter to view
          let visibleHistory = historicalHolds;
          if (currentStatusFilter === 'EXPIRED') {
            visibleHistory = historicalHolds.filter(h => h.status === 'EXPIRED');
          } else if (currentStatusFilter === 'CANCELLED') {
            visibleHistory = historicalHolds.filter(h => h.status === 'CANCELLED');
          }

          let currentAdmissionHtml = '';
          if (currentAdmission) {
            const isConfirmed = currentAdmission.status === 'CONFIRMED';
            const isHeld = currentAdmission.status === 'HELD';
            const remSec = isHeld ? Math.max(0, Math.floor((new Date(currentAdmission.expiresAt).getTime() - Date.now()) / 1000)) : 0;

            currentAdmissionHtml = `
              <div class="current-admission-section">
                <div class="section-title-sm">
                  <span class="pulse-indicator ${isConfirmed ? 'bg-emerald' : 'bg-amber'}"></span>
                  <span>Active Admission Record</span>
                </div>

                <div class="application-hero-card ${isConfirmed ? 'card-confirmed' : 'card-held'}">
                  <div class="app-card-header">
                    <div>
                      <span class="badge ${isConfirmed ? 'badge-confirmed' : 'badge-held'}">
                        ${isConfirmed ? Utils.icons.checkCircle : Utils.icons.clock} ${currentAdmission.status}
                      </span>
                      <h2 class="app-card-title mt-2">${Utils.escapeHtml(currentAdmission.className)}</h2>
                      <div class="app-card-meta">
                        <span>Application Code: <code class="font-bold">${Utils.escapeHtml(currentAdmission.applicationCode || currentAdmission.holdId)}</code></span>
                        <span>&bull;</span>
                        <span>Date: ${Utils.formatDate(currentAdmission.createdAt)}</span>
                      </div>
                    </div>

                    ${isHeld ? `
                      <div class="app-card-timer-box">
                        <span class="timer-label">Seat Reserved For:</span>
                        <div class="timer-display-mini font-mono font-bold" id="app-mini-countdown">
                          ${Utils.formatTimeRemaining(remSec)}
                        </div>
                        <span class="timer-hint">Auto-releases if unconfirmed</span>
                      </div>
                    ` : `
                      <div class="app-card-confirmed-box">
                        <div class="confirmed-seal">
                          ${Utils.icons.checkCircle}
                          <span>Official Admission</span>
                        </div>
                      </div>
                    `}
                  </div>

                  <div class="app-card-actions">
                    <a href="#/applications/${currentAdmission.holdId}" class="btn ${isConfirmed ? 'btn-primary' : 'btn-warning'}">
                      ${isConfirmed ? 'View Admission Details & Slip' : 'Manage Seat Hold & Pay Fee'} ${Utils.icons.arrowRight}
                    </a>
                  </div>
                </div>
              </div>
            `;
          }

          let historyHtml = '';
          if (historicalHolds.length > 0) {
            historyHtml = `
              <div class="history-section mt-5">
                <div class="history-header-row">
                  <h3 class="section-title-sm">Previous Applications History</h3>
                  <div class="status-tabs">
                    <button type="button" class="tab-btn ${currentStatusFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">All (${historicalHolds.length})</button>
                    <button type="button" class="tab-btn ${currentStatusFilter === 'EXPIRED' ? 'active' : ''}" data-filter="EXPIRED">Expired</button>
                    <button type="button" class="tab-btn ${currentStatusFilter === 'CANCELLED' ? 'active' : ''}" data-filter="CANCELLED">Cancelled</button>
                  </div>
                </div>

                <div class="table-responsive">
                  <table class="app-history-table">
                    <thead>
                      <tr>
                        <th>Application Code</th>
                        <th>Class &amp; Shift</th>
                        <th>Status</th>
                        <th>Applied On</th>
                        <th>Resolution</th>
                        <th class="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${visibleHistory.map(h => {
                        let statusBadge = '';
                        if (h.status === 'EXPIRED') {
                          statusBadge = `<span class="badge badge-expired">${Utils.icons.alertCircle} EXPIRED</span>`;
                        } else if (h.status === 'CANCELLED') {
                          statusBadge = `<span class="badge badge-cancelled">${Utils.icons.close} CANCELLED</span>`;
                        } else {
                          statusBadge = `<span class="badge">${h.status}</span>`;
                        }

                        return `
                          <tr>
                            <td class="font-mono font-semibold">${Utils.escapeHtml(h.applicationCode || h.holdId)}</td>
                            <td>${Utils.escapeHtml(h.className)}</td>
                            <td>${statusBadge}</td>
                            <td>${Utils.formatDate(h.createdAt)}</td>
                            <td class="text-muted text-sm">${h.status === 'EXPIRED' ? 'Time expired, seat released' : 'Cancelled by candidate'}</td>
                            <td class="text-right">
                              <a href="#/applications/${h.holdId}" class="btn btn-outline btn-sm">
                                View Details
                              </a>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          } else if (!currentAdmission) {
            historyHtml = Components.renderEmptyState({
              icon: Utils.icons.book,
              title: 'No Applications Recorded',
              description: 'You have no active or historical applications.',
              actionText: 'Explore Available Classes',
              actionHref: '#/admissions/classes'
            });
          }

          contentAreaEl.innerHTML = currentAdmissionHtml + historyHtml;

          // Tab click handling
          const tabs = contentAreaEl.querySelectorAll('.tab-btn');
          tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
              currentStatusFilter = e.currentTarget.getAttribute('data-filter');
              loadAndRenderApplications();
            });
          });

          // Mini countdown interval
          const countdownEl = document.getElementById('app-mini-countdown');
          if (countdownEl && activeHold) {
            if (activeCountdownTimer) clearInterval(activeCountdownTimer);
            activeCountdownTimer = setInterval(() => {
              const remaining = Math.max(0, Math.floor((new Date(activeHold.expiresAt).getTime() - Date.now()) / 1000));
              countdownEl.textContent = Utils.formatTimeRemaining(remaining);
              if (remaining <= 0) {
                clearInterval(activeCountdownTimer);
                loadAndRenderApplications();
              }
            }, 1000);
          }

        } catch (err) {
          console.error('Error fetching student applications:', err);
          contentAreaEl.innerHTML = `
            <div class="alert alert-danger">
              Failed to load applications: ${Utils.escapeHtml(err.message)}
            </div>
          `;
        }
      }

      await loadAndRenderApplications();

      // Refresh periodically every 5 seconds
      activePageInterval = setInterval(() => {
        loadAndRenderApplications();
      }, 5000);
    },

    /* =========================================================================
     * PAGE 4: APPLICATION DETAILS (#/applications/:holdId)
     * ========================================================================= */
    async renderApplicationDetailsPage(container, holdId) {
      clearActiveTimers();

      container.innerHTML = `
        <div class="app-details-page-wrapper">
          <div class="container">
            <div class="page-breadcrumbs pt-6 mb-4">
              <a href="#/">Home</a> / <a href="#/my-applications">Applications</a> / <span>Application Details</span>
            </div>
            <div class="app-reference-row mb-6">
              <span class="font-mono text-xs text-muted" id="app-id-subtitle">
                Hold Reference: ${Utils.escapeHtml(holdId)}
              </span>
            </div>

            <div id="details-content-area" class="app-details-container">
              <div class="skeleton-line" style="width: 100%; height: 260px;"></div>
            </div>
          </div>
        </div>
      `;

      const contentArea = container.querySelector('#details-content-area');

      async function loadDetails() {
        try {
          const hold = await MockApi.getHoldById(holdId);

          // Render appropriate state view
          if (hold.status === 'HELD') {
            renderHeldState(hold);
          } else if (hold.status === 'CONFIRMED') {
            renderConfirmedState(hold);
          } else if (hold.status === 'EXPIRED') {
            renderExpiredState(hold);
          } else if (hold.status === 'CANCELLED') {
            renderCancelledState(hold);
          } else {
            contentArea.innerHTML = `<p>Unknown status: ${hold.status}</p>`;
          }
        } catch (err) {
          contentArea.innerHTML = Components.renderEmptyState({
            icon: Utils.icons.alertTriangle,
            title: 'Application Not Found',
            description: `We could not locate an admission application with reference "${holdId}".`,
            actionText: 'Back to My Applications',
            actionHref: '#/my-applications'
          });
        }
      }

      // STATE A: HELD
      function renderHeldState(hold) {
        const expTime = new Date(hold.expiresAt).getTime();
        let remainingSeconds = Math.max(0, Math.floor((expTime - Date.now()) / 1000));

        contentArea.innerHTML = `
          <div class="details-card details-card-held">
            <div class="details-status-bar status-bar-held">
              <div class="status-left">
                <span class="badge badge-held">${Utils.icons.clock} SEAT RESERVED (HELD)</span>
                <span class="status-tip">Temporary Seat Reservation</span>
              </div>
              <div class="status-right font-mono text-sm text-muted">
                Created: ${Utils.formatDate(hold.createdAt)}
              </div>
            </div>

            <!-- Prominent Countdown Timer -->
            <div class="countdown-hero-block">
              <span class="countdown-title">RESERVATION EXPIRES IN</span>
              <div class="countdown-timer-large font-mono" id="details-countdown">
                ${Utils.formatTimeRemaining(remainingSeconds)}
              </div>
              <!-- Prominent Class Details (Class, Shift, Group, Admission Fee, Session) -->
              <div class="held-class-specs-badges">
                <div class="held-spec-pill">
                  <span class="spec-label">Class</span>
                  <span class="spec-value font-bold">${Utils.escapeHtml(hold.grade || hold.classInfo?.grade || 'Class')}</span>
                </div>
                <div class="held-spec-pill">
                  <span class="spec-label">Shift</span>
                  <span class="spec-value font-bold">${Utils.escapeHtml(hold.shift || hold.classInfo?.shift || 'Morning')}</span>
                </div>
                ${(hold.group && hold.group !== 'General') || (hold.classInfo?.group && hold.classInfo?.group !== 'General') ? `
                  <div class="held-spec-pill highlight-group">
                    <span class="spec-label">Group</span>
                    <span class="spec-value font-bold text-teal">${Utils.escapeHtml(hold.group || hold.classInfo?.group)}</span>
                  </div>
                ` : ''}
                <div class="held-spec-pill highlight-fee">
                  <span class="spec-label">Admission Fee</span>
                  <span class="spec-value font-bold text-emerald font-mono">৳${(hold.classInfo?.fee || 1500).toLocaleString()}</span>
                </div>
                <div class="held-spec-pill">
                  <span class="spec-label">Session</span>
                  <span class="spec-value font-bold">${Utils.escapeHtml(hold.session || hold.classInfo?.session || 'Session 27')}</span>
                </div>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="details-info-grid">
              <div class="info-cell">
                <span class="info-label">Application Code</span>
                <span class="info-val font-mono font-bold">${Utils.escapeHtml(hold.applicationCode || hold.holdId)}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Class &amp; Shift</span>
                <span class="info-val font-semibold">${Utils.escapeHtml(hold.className)}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Student ID</span>
                <span class="info-val font-mono">${Utils.maskStudentId(hold.studentId)}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Reservation Expiry</span>
                <span class="info-val">${Utils.formatDate(hold.expiresAt)}</span>
              </div>
            </div>

            <!-- Action Controls -->
            <div class="details-actions-bar">
              <button type="button" class="btn btn-success btn-lg" id="btn-pay-admission">
                ${Utils.icons.creditCard} Pay Admission Fee
              </button>
              <button type="button" class="btn btn-outline-danger" id="btn-cancel-reservation">
                ${Utils.icons.close} Cancel Reservation
              </button>
            </div>
          </div>
        `;

        const countdownEl = contentArea.querySelector('#details-countdown');
        const payBtn = contentArea.querySelector('#btn-pay-admission');
        const cancelBtn = contentArea.querySelector('#btn-cancel-reservation');

        // Start 1-second countdown
        if (activeCountdownTimer) clearInterval(activeCountdownTimer);
        activeCountdownTimer = setInterval(async () => {
          remainingSeconds = Math.max(0, Math.floor((expTime - Date.now()) / 1000));
          if (countdownEl) {
            countdownEl.textContent = Utils.formatTimeRemaining(remainingSeconds);
            if (remainingSeconds <= 60) {
              countdownEl.classList.add('timer-urgent');
            }
          }

          if (remainingSeconds <= 0) {
            clearInterval(activeCountdownTimer);
            if (payBtn) payBtn.disabled = true;
            Components.showToast('Seat reservation has expired and the seat was released.', 'warning', 5000);
            await Store.expireHolds();
            await AppState.refreshAdmissionState();
            await loadDetails();
          }
        }, 1000);

        // Bind Pay Fee Button
        payBtn.addEventListener('click', () => {
          Components.showPaymentModal({
            hold,
            onConfirm: async () => {
              const confirmedHold = await MockApi.confirmHold(hold.holdId, AppState.studentId);
              await AppState.refreshAdmissionState();
              Components.showToast('Admission successfully confirmed! Congratulations!', 'success');
              renderConfirmedState(confirmedHold);
            }
          });
        });

        // Bind Cancel Reservation Button
        cancelBtn.addEventListener('click', () => {
          Components.showCancelModal({
            hold,
            onConfirm: async () => {
              const cancelled = await MockApi.cancelHold(hold.holdId, AppState.studentId);
              await AppState.refreshAdmissionState();
              Components.showToast('Seat reservation cancelled. The seat has been released.', 'info');
              renderCancelledState(cancelled);
            }
          });
        });
      }

      // STATE B: CONFIRMED
      function renderConfirmedState(hold) {
        if (activeCountdownTimer) clearInterval(activeCountdownTimer);

        contentArea.innerHTML = `
          <div class="details-card details-card-confirmed">
            <div class="confirmed-hero-banner">
              <div class="confirmed-icon-circle">${Utils.icons.checkCircle}</div>
              <h2 class="confirmed-title">Admission Confirmed</h2>
              <p class="confirmed-subtitle">
                Congratulations! You are officially enrolled at Hashmat Uddin High School for Session 27 (2026–2027).
              </p>
            </div>

            <!-- Official Admission Certificate / Slip Preview -->
            <div class="admission-slip-box" id="admission-slip">
              <div class="slip-header">
                <div class="slip-brand">
                  <span class="slip-crest">${Utils.icons.logo}</span>
                  <div>
                    <h3 class="slip-school-name">Hashmat Uddin High School</h3>
                    <p class="slip-office">Office of Admissions &bull; Official Enrollment Slip</p>
                  </div>
                </div>
                <div class="slip-status-badge">
                  <span class="badge badge-confirmed">CONFIRMED</span>
                </div>
              </div>

              <div class="slip-body-grid">
                <div class="slip-row">
                  <span class="slip-label">Application Code:</span>
                  <span class="slip-value font-mono font-bold">${Utils.escapeHtml(hold.applicationCode || hold.holdId)}</span>
                </div>
                <div class="slip-row">
                  <span class="slip-label">Candidate Birth Registration:</span>
                  <span class="slip-value font-mono">${Utils.maskStudentId(hold.studentId)}</span>
                </div>
                <div class="slip-row">
                  <span class="slip-label">Enrolled Class:</span>
                  <span class="slip-value font-semibold text-primary">${Utils.escapeHtml(hold.className)}</span>
                </div>
                <div class="slip-row">
                  <span class="slip-label">Confirmation Timestamp:</span>
                  <span class="slip-value">${Utils.formatDate(hold.confirmedAt || hold.createdAt)}</span>
                </div>
                <div class="slip-row">
                  <span class="slip-label">Admission Fee Status:</span>
                  <span class="slip-value text-emerald font-semibold">PAID (Simulated Confirmation)</span>
                </div>
                <div class="slip-row">
                  <span class="slip-label">Seat Status:</span>
                  <span class="slip-value font-semibold">Guaranteed &bull; Quota Locked</span>
                </div>
              </div>

              <div class="slip-footer">
                <p class="text-xs text-muted">
                  This document serves as proof of online seat allocation. Please retain this slip reference for school orientation and document verification.
                </p>
              </div>
            </div>

            <div class="details-actions-bar text-center mt-4">
              <button type="button" class="btn btn-outline" id="btn-print-slip">
                ${Utils.icons.download} Print / Save Slip
              </button>
              <a href="#/my-applications" class="btn btn-primary">
                View My Applications
              </a>
            </div>
          </div>
        `;

        const printBtn = contentArea.querySelector('#btn-print-slip');
        if (printBtn) {
          printBtn.addEventListener('click', () => {
            window.print();
          });
        }
      }

      // STATE C: EXPIRED
      function renderExpiredState(hold) {
        if (activeCountdownTimer) clearInterval(activeCountdownTimer);

        contentArea.innerHTML = `
          <div class="details-card details-card-expired">
            <div class="resolution-hero-banner banner-expired">
              <div class="resolution-icon-circle icon-expired">${Utils.icons.alertCircle}</div>
              <h2 class="resolution-title">Reservation Expired</h2>
              <p class="resolution-subtitle">
                The 10-minute hold window for this seat expired without fee confirmation. The seat has been released and returned to the school's available quota.
              </p>
            </div>

            <div class="details-info-grid mt-4">
              <div class="info-cell">
                <span class="info-label">Application Code</span>
                <span class="info-val font-mono">${Utils.escapeHtml(hold.applicationCode || hold.holdId)}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Class</span>
                <span class="info-val">${Utils.escapeHtml(hold.className)}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Candidate ID</span>
                <span class="info-val font-mono">${Utils.maskStudentId(hold.studentId)}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Expired At</span>
                <span class="info-val">${Utils.formatDate(hold.expiredAt || hold.expiresAt)}</span>
              </div>
            </div>

            <div class="details-actions-bar mt-4">
              <a href="#/admissions/classes" class="btn btn-primary btn-lg">
                Browse Available Classes
              </a>
              <a href="#/my-applications" class="btn btn-secondary">
                View All Applications
              </a>
            </div>
          </div>
        `;
      }

      // STATE D: CANCELLED
      function renderCancelledState(hold) {
        if (activeCountdownTimer) clearInterval(activeCountdownTimer);

        contentArea.innerHTML = `
          <div class="details-card details-card-cancelled">
            <div class="resolution-hero-banner banner-cancelled">
              <div class="resolution-icon-circle icon-cancelled">${Utils.icons.close}</div>
              <h2 class="resolution-title">Reservation Cancelled</h2>
              <p class="resolution-subtitle">
                You cancelled this seat reservation. The reserved seat in <strong>${Utils.escapeHtml(hold.className)}</strong> was immediately returned to the school's open quota.
              </p>
            </div>

            <div class="details-info-grid mt-4">
              <div class="info-cell">
                <span class="info-label">Application Code</span>
                <span class="info-val font-mono">${Utils.escapeHtml(hold.applicationCode || hold.holdId)}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Class</span>
                <span class="info-val">${Utils.escapeHtml(hold.className)}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Candidate ID</span>
                <span class="info-val font-mono">${Utils.maskStudentId(hold.studentId)}</span>
              </div>
              <div class="info-cell">
                <span class="info-label">Cancelled At</span>
                <span class="info-val">${Utils.formatDate(hold.cancelledAt || new Date().toISOString())}</span>
              </div>
            </div>

            <div class="details-actions-bar mt-4">
              <a href="#/admissions/classes" class="btn btn-primary btn-lg">
                Choose Another Class
              </a>
              <a href="#/my-applications" class="btn btn-secondary">
                View All Applications
              </a>
            </div>
          </div>
        `;
      }

      await loadDetails();
    },

    /* =========================================================================
     * AUTHORITY PORTAL (ADMINISTRATION)
     * ========================================================================= */

    /**
     * Requirement 1: Authority Verification Screen
     * Appears whenever an unverified user navigates to any admin route.
     * Uses ONLY a password for verification.
     */
    async renderAuthorityVerificationPage(container, onVerified) {
      clearActiveTimers();

      container.innerHTML = `
        <div class="auth-verify-wrapper">
          <div class="auth-verify-card">
            <div class="verify-crest-box">
              <span class="verify-crest">${Utils.icons.schoolShield}</span>
            </div>
            <div class="verify-header text-center">
              <span class="badge badge-cancelled">CONFIDENTIAL &bull; RESTRICTED ACCESS</span>
              <h1 class="verify-title mt-2">Authority Verification</h1>
              <p class="verify-subtitle">
                Enter the administration passcode to access Hashmat Uddin High School's authority portal.
              </p>
            </div>

            <form id="admin-verify-form" class="verify-form" novalidate>
              <div class="form-group">
                <label for="admin-passcode-input" class="form-label">Authority Passcode</label>
                <div class="password-input-wrapper">
                  <input
                    type="password"
                    id="admin-passcode-input"
                    class="form-control"
                    placeholder="Enter administration passcode"
                    required
                    autocomplete="current-password"
                    autofocus
                  />
                  <button type="button" id="btn-toggle-password" class="btn-toggle-pass" aria-label="Toggle password visibility">
                    Show
                  </button>
                </div>
                <div id="admin-passcode-error" class="form-error" style="display: none;"></div>
              </div>

              <button type="submit" id="btn-verify-submit" class="btn btn-primary btn-block btn-lg">
                Verify Passcode &amp; Enter Portal
              </button>

              <div class="verify-demo-hint">
                <span class="hint-icon">${Utils.icons.info}</span>
                <span>Demo Passcode: <code>admin2026</code></span>
              </div>
            </form>

            <div class="verify-footer text-center">
              <a href="#/" class="link-muted">
                ${Utils.icons.arrowLeft} Return to Public Student Portal
              </a>
            </div>
          </div>
        </div>
      `;

      const form = container.querySelector('#admin-verify-form');
      const input = container.querySelector('#admin-passcode-input');
      const errorEl = container.querySelector('#admin-passcode-error');
      const submitBtn = container.querySelector('#btn-verify-submit');
      const toggleBtn = container.querySelector('#btn-toggle-password');

      if (toggleBtn && input) {
        toggleBtn.addEventListener('click', () => {
          const isPass = input.type === 'password';
          input.type = isPass ? 'text' : 'password';
          toggleBtn.textContent = isPass ? 'Hide' : 'Show';
        });
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const pass = input.value;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-sm"></span> Verifying...`;
        errorEl.style.display = 'none';

        try {
          await MockApi.verifyAdminPassword(pass);
          Components.showToast('Authority access verified.', 'success');
          if (onVerified) onVerified();
        } catch (err) {
          errorEl.textContent = err.message || 'Verification failed.';
          errorEl.style.display = 'block';
          input.focus();
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Verify Passcode &amp; Enter Portal';
        }
      });
    },

    /**
     * Requirement 2: Admin Landing Page (Dashboard)
     * 1. Top Section: Left Admission Year 2027 with clock under it; Right Admission Start & Closing Dates (no update button)
     * 2. Stat Section (Centered numbers, subtext removed)
     * 3. Activity Section: No colored headings, no descriptions, buttons named Create, View, Update
     * 4. Class list section removed
     */
    async renderAuthorityLandingPage(container) {
      clearActiveTimers();

      let currentTimeline = await MockApi.getAdmissionTimeline();

      function formatFullDate(isoStr) {
        try {
          const d = new Date(isoStr);
          const opts = { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
          return d.toLocaleString('en-US', opts);
        } catch (e) {
          return isoStr;
        }
      }

      container.innerHTML = `
        <div class="authority-portal-wrapper">
          <div class="container authority-body">
            <!-- 1. Top Section -->
            <div class="authority-top-hero">
              <div class="hero-header-left">
                <h1 class="landing-hero-title font-bold">Admission Year 2027</h1>
                <div class="hero-live-clock-box">
                  <div class="clock-label-row">
                    <span class="timer-dot-pulse"></span>
                    <span class="clock-status-text" id="admin-timer-title">Session 2027 Admission Closes In:</span>
                  </div>
                  <div class="clock-digits font-mono" id="admin-admission-clock">Calculating schedule...</div>
                </div>
              </div>

              <div class="hero-header-right">
                <div class="admin-dates-panel">
                  <div class="admin-date-row">
                    <span class="admin-date-label">Admission Start Date</span>
                    <span class="admin-date-value font-semibold" id="admin-hero-start-date">
                      ${formatFullDate(currentTimeline.startDate)}
                    </span>
                  </div>
                  <div class="admin-date-divider"></div>
                  <div class="admin-date-row">
                    <span class="admin-date-label">Admission Closing Date</span>
                    <span class="admin-date-value font-semibold text-danger" id="admin-hero-end-date">
                      ${formatFullDate(currentTimeline.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Stat Section: Centered numbers, text below removed -->
            <div class="metrics-grid" id="authority-landing-metrics">
              <div class="metric-card">
                <span class="metric-label">Active Classes</span>
                <span class="metric-val" id="hub-metric-classes">—</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Total Seat Capacity</span>
                <span class="metric-val text-primary" id="hub-metric-seats">—</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Admitted Students</span>
                <span class="metric-val text-teal" id="hub-metric-confirmed">—</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Active Holds (Pending)</span>
                <span class="metric-val text-amber" id="hub-metric-held">—</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Available Seats</span>
                <span class="metric-val text-emerald font-bold" id="hub-metric-available">—</span>
              </div>
            </div>

            <!-- 3. Activity Section: No colored headers, no descriptions, buttons named Create, View, Update -->
            <div class="hub-modules-grid" id="authority-interactive-actions">
              <!-- 1. Create New Classes -->
              <div class="hub-module-card interactive-card">
                <h3 class="module-title">Create New Classes</h3>
                <div class="module-footer">
                  <a href="#/authority/create-class" class="btn btn-primary btn-block">
                    Create
                  </a>
                </div>
              </div>

              <!-- 2. Admission Statistics -->
              <div class="hub-module-card interactive-card">
                <h3 class="module-title">Admission Statistics</h3>
                <div class="module-footer">
                  <a href="#/authority/statistics" class="btn btn-outline btn-block">
                    View
                  </a>
                </div>
              </div>

              <!-- 3. Update Admission Time -->
              <div class="hub-module-card interactive-card">
                <h3 class="module-title">Update Admission Time</h3>
                <div class="module-footer">
                  <button type="button" class="btn btn-outline btn-block" id="btn-interactive-update-time">
                    Update
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;

      const mClasses = container.querySelector('#hub-metric-classes');
      const mSeats = container.querySelector('#hub-metric-seats');
      const mConfirmed = container.querySelector('#hub-metric-confirmed');
      const mHeld = container.querySelector('#hub-metric-held');
      const mAvailable = container.querySelector('#hub-metric-available');

      const timerTitleEl = container.querySelector('#admin-timer-title');
      const timerClockEl = container.querySelector('#admin-admission-clock');
      const startDateEl = container.querySelector('#admin-hero-start-date');
      const endDateEl = container.querySelector('#admin-hero-end-date');

      function updateAdminCountdown() {
        if (!timerClockEl) return;
        const now = Date.now();
        const start = new Date(currentTimeline.startDate).getTime();
        const end = new Date(currentTimeline.endDate).getTime();

        if (startDateEl) startDateEl.textContent = formatFullDate(currentTimeline.startDate);
        if (endDateEl) endDateEl.textContent = formatFullDate(currentTimeline.endDate);

        if (now < start) {
          if (timerTitleEl) timerTitleEl.textContent = 'Session 2027 Admission Starts In:';
          timerClockEl.textContent = Utils.formatDhms(start - now);
        } else if (now >= start && now <= end) {
          if (timerTitleEl) timerTitleEl.textContent = 'Session 2027 Admission Closes In:';
          timerClockEl.textContent = Utils.formatDhms(end - now);
        } else {
          if (timerTitleEl) timerTitleEl.textContent = 'Session 2027 Admission Schedule:';
          timerClockEl.textContent = 'Admission Window Closed';
        }
      }

      updateAdminCountdown();
      activeCountdownTimer = setInterval(updateAdminCountdown, 1000);

      const openTimeModal = () => {
        Components.showUpdateAdmissionTimeModal({
          currentTimeline,
          onSave: (updatedTimeline) => {
            currentTimeline = updatedTimeline;
            updateAdminCountdown();
            refreshLandingData();
          }
        });
      };

      container.querySelector('#btn-interactive-update-time')?.addEventListener('click', openTimeModal);

      async function refreshLandingData() {
        try {
          const summary = await MockApi.getAuthoritySummary();

          if (mClasses) mClasses.textContent = summary.totalClasses;
          if (mSeats) mSeats.textContent = summary.totalCapacity;
          if (mConfirmed) mConfirmed.textContent = summary.totalConfirmed;
          if (mHeld) mHeld.textContent = summary.totalHeld;
          if (mAvailable) mAvailable.textContent = summary.totalAvailable;
        } catch (err) {
          console.error('Error fetching authority landing data:', err);
        }
      }

      await refreshLandingData();
      activePageInterval = setInterval(refreshLandingData, 5000);
    },

    /**
     * DEDICATED ADMIN PAGE: CREATE CLASS (#/authority/create-class)
     * Minimalist, centered form with Year 2027, Class, Group, Shift, Seats, Fee.
     * Prevents duplicate sections and displays class details with a link to Statistics page.
     */
    async renderAuthorityCreateClassPage(container) {
      clearActiveTimers();

      container.innerHTML = `
        <div class="authority-portal-wrapper">
          <div class="container authority-body">
            <!-- 2. Centered Page Title with generous spacing -->
            <div class="create-class-page-header">
              <h1 class="authority-title">Create Admission Class</h1>
            </div>

            <!-- 3. Centered Form Container (Rearranged into a clean 2-column grid) -->
            <div class="create-class-centered-container">
              <div class="authority-card create-class-card" id="create-class-card">
                <!-- 4. Form for creating new classes -->
                <form id="dedicated-create-class-form" novalidate>
                  <div class="create-class-form-grid">
                    <!-- Row 1: Academic Year (Col 1) & Class (Col 2) -->
                    <div class="form-group">
                      <label for="create-page-year" class="form-label">
                        Academic Year <span class="text-danger">*</span>
                      </label>
                      <select id="create-page-year" class="form-control form-select">
                        <option value="2027" selected>2027</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="create-page-class" class="form-label">
                        Class <span class="text-danger">*</span>
                      </label>
                      <select id="create-page-class" class="form-control form-select">
                        <option value="Class 6" selected>Class 6</option>
                        <option value="Class 7">Class 7</option>
                        <option value="Class 8">Class 8</option>
                        <option value="Class 9">Class 9</option>
                        <option value="Class 10">Class 10</option>
                      </select>
                    </div>

                    <!-- Row 2: Shift (Col 1) & Group (Col 2) -->
                    <div class="form-group">
                      <label for="create-page-shift" class="form-label">
                        Shift <span class="text-danger">*</span>
                      </label>
                      <select id="create-page-shift" class="form-control form-select">
                        <option value="Morning" selected>Morning</option>
                        <option value="Day">Day</option>
                      </select>
                    </div>

                    <div class="form-group" id="create-page-group-box">
                      <label for="create-page-group" class="form-label">
                        Group <span class="text-danger">*</span>
                      </label>
                      <select id="create-page-group" class="form-control form-select" disabled>
                        <option value="General" selected>General</option>
                      </select>
                    </div>

                    <!-- Row 3: Total Seats (Col 1) & Admission Fee (Col 2) -->
                    <div class="form-group">
                      <label for="create-page-seats" class="form-label">
                        Total Seats <span class="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        id="create-page-seats"
                        class="form-control"
                        placeholder="e.g. 40"
                        min="1"
                        max="500"
                        value="40"
                        required
                      />
                      <div id="create-page-seats-error" class="form-error-msg" style="display: none; color: #ef4444; font-size: 0.8125rem; margin-top: 4px;"></div>
                    </div>

                    <div class="form-group">
                      <label for="create-page-fee" class="form-label">
                        Admission Fee (৳ BDT) <span class="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        id="create-page-fee"
                        class="form-control"
                        placeholder="e.g. 1500"
                        min="100"
                        max="50000"
                        value="1500"
                        required
                      />
                      <div id="create-page-fee-error" class="form-error-msg" style="display: none; color: #ef4444; font-size: 0.8125rem; margin-top: 4px;"></div>
                    </div>
                  </div>

                  <div id="create-page-general-error" class="alert alert-danger mt-4 mb-2" style="display: none;"></div>

                  <!-- 6. Button text: strictly 'Create Class' -->
                  <button type="submit" id="btn-create-page-submit" class="btn btn-primary btn-block btn-lg btn-create-submit">
                    Create Class
                  </button>
                </form>

                <!-- 6. Post-Creation Success View: Class Details + Button to Stat Page -->
                <div id="create-class-success-view" class="p-6 text-center" style="display: none;">
                  <div class="mb-5">
                    <div class="success-icon-badge mb-3">
                      ${Utils.icons.checkCircle}
                    </div>
                    <h2 class="text-2xl font-bold text-primary-900 mb-1">Class Created Successfully!</h2>
                    <p class="text-sm text-muted">The new academic class is now registered and active in the system.</p>
                  </div>

                  <div class="created-class-details-card mb-6 text-left">
                    <div class="details-row">
                      <span class="details-label">Class Name:</span>
                      <span class="details-value font-bold text-primary" id="success-class-name">—</span>
                    </div>
                    <div class="details-row">
                      <span class="details-label">Academic Year:</span>
                      <span class="details-value font-semibold" id="success-class-year">2027</span>
                    </div>
                    <div class="details-row">
                      <span class="details-label">Class:</span>
                      <span class="details-value font-semibold" id="success-class-grade">—</span>
                    </div>
                    <div class="details-row">
                      <span class="details-label">Shift:</span>
                      <span class="details-value font-semibold" id="success-class-shift">—</span>
                    </div>
                    <div class="details-row">
                      <span class="details-label">Group:</span>
                      <span class="details-value font-semibold" id="success-class-group">—</span>
                    </div>
                    <div class="details-row">
                      <span class="details-label">Total Seats:</span>
                      <span class="details-value font-bold text-emerald" id="success-class-seats">—</span>
                    </div>
                    <div class="details-row">
                      <span class="details-label">Admission Fee:</span>
                      <span class="details-value font-bold font-mono text-primary" id="success-class-fee">—</span>
                    </div>
                  </div>

                  <div class="success-actions-col">
                    <a href="#/authority/statistics" class="btn btn-primary btn-block btn-lg" id="btn-goto-stats">
                      Move to Statistics Page &rarr;
                    </a>
                    <button type="button" class="btn btn-outline btn-block mt-3" id="btn-create-another">
                      Create Another Class
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const form = container.querySelector('#dedicated-create-class-form');
      const successView = container.querySelector('#create-class-success-view');
      const classSelect = container.querySelector('#create-page-class');
      const groupSelect = container.querySelector('#create-page-group');
      const shiftSelect = container.querySelector('#create-page-shift');
      const seatsInput = container.querySelector('#create-page-seats');
      const feeInput = container.querySelector('#create-page-fee');

      const seatsError = container.querySelector('#create-page-seats-error');
      const feeError = container.querySelector('#create-page-fee-error');
      const generalError = container.querySelector('#create-page-general-error');
      const submitBtn = container.querySelector('#btn-create-page-submit');

      function updateGroupDropdown() {
        const grade = classSelect.value;
        const isHigher = grade === 'Class 9' || grade === 'Class 10';

        if (isHigher) {
          // Class 9 and 10: Science, Commerce, Arts (CANNOT select General)
          groupSelect.disabled = false;
          groupSelect.innerHTML = `
            <option value="Science" selected>Science</option>
            <option value="Commerce">Commerce</option>
            <option value="Arts">Arts</option>
          `;
          feeInput.value = '1800';
        } else {
          // Class 6 to 8: Auto select General
          groupSelect.disabled = true;
          groupSelect.innerHTML = `
            <option value="General" selected>General</option>
          `;
          feeInput.value = '1500';
        }
        checkDuplicateLive();
      }

      function checkDuplicateLive() {
        if (!generalError) return;
        generalError.style.display = 'none';
        const grade = classSelect.value;
        const shift = shiftSelect.value;
        const group = groupSelect.value;
        const duplicate = Store.findDuplicateClass(grade, shift, group, '2027');
        if (duplicate) {
          generalError.textContent = `This class already exists: "${duplicate.name}" is already created for Year 2027. You cannot create duplicate classes.`;
          generalError.style.display = 'block';
          submitBtn.disabled = true;
        } else {
          submitBtn.disabled = false;
        }
      }

      classSelect.addEventListener('change', updateGroupDropdown);
      groupSelect.addEventListener('change', () => {
        if (groupSelect.value === 'Science') feeInput.value = '1800';
        else if (groupSelect.value === 'Commerce' || groupSelect.value === 'Arts') feeInput.value = '1700';
        checkDuplicateLive();
      });
      shiftSelect.addEventListener('change', checkDuplicateLive);

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        seatsError.style.display = 'none';
        feeError.style.display = 'none';
        generalError.style.display = 'none';

        const grade = classSelect.value;
        const shift = shiftSelect.value;
        const group = groupSelect.value;
        const seats = parseInt(seatsInput.value, 10);
        const fee = parseInt(feeInput.value, 10);

        if (isNaN(seats) || seats <= 0) {
          seatsError.textContent = 'Please enter a valid seat count.';
          seatsError.style.display = 'block';
          seatsInput.focus();
          return;
        }

        if (isNaN(fee) || fee <= 0) {
          feeError.textContent = 'Please enter a valid admission fee.';
          feeError.style.display = 'block';
          feeInput.focus();
          return;
        }

        // 5. Duplicate Class Prevention Check
        const duplicate = Store.findDuplicateClass(grade, shift, group, '2027');
        if (duplicate) {
          generalError.textContent = `This class already exists: "${duplicate.name}" is already created for Year 2027. Cannot create this class again.`;
          generalError.style.display = 'block';
          Components.showToast('This class already exists for Year 2027.', 'error');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-sm"></span> Creating...`;

        try {
          const timeline = Store.getTimeline ? Store.getTimeline() : {
            startDate: '2026-11-01T08:00:00.000Z',
            endDate: '2026-11-30T23:59:59.000Z'
          };

          const created = await MockApi.createClass({
            grade,
            shift,
            group,
            session: 'Session 27',
            totalSeats: seats,
            fee,
            admissionStartDate: timeline.startDate,
            admissionEndDate: timeline.endDate
          });

          // 6. Populate class details and show success view
          container.querySelector('#success-class-name').textContent = created.name;
          container.querySelector('#success-class-year').textContent = '2027';
          container.querySelector('#success-class-grade').textContent = created.grade;
          container.querySelector('#success-class-shift').textContent = created.shift;
          container.querySelector('#success-class-group').textContent = created.group || 'General';
          container.querySelector('#success-class-seats').textContent = `${created.totalSeats} Seats`;
          container.querySelector('#success-class-fee').textContent = `৳${created.fee.toLocaleString()}`;

          form.style.display = 'none';
          successView.style.display = 'block';
          Components.showToast(`Class "${created.name}" created successfully!`, 'success');

        } catch (err) {
          generalError.textContent = err.message || 'Failed to create class.';
          generalError.style.display = 'block';
          Components.showToast(err.message, 'error', 5000);
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Class';
        }
      });

      container.querySelector('#btn-create-another')?.addEventListener('click', () => {
        successView.style.display = 'none';
        form.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Class';
        classSelect.value = 'Class 6';
        updateGroupDropdown();
      });

      updateGroupDropdown();
    },

    /**
     * DEDICATED ADMIN PAGE: ADMISSION STATISTICS (#/authority/statistics)
     * Comprehensive analytical metrics, vertical bar chart breakdowns with colors, and class cards.
     */
    async renderAuthorityStatisticsPage(container) {
      clearActiveTimers();

      container.innerHTML = `
        <div class="authority-portal-wrapper">
          <div class="container authority-body">
            <!-- Breadcrumbs with generous spacing -->
            <div class="page-breadcrumbs stats-page-breadcrumbs mb-6">
              <a href="#/authority/admission-management">Dashboard</a> / <span>Admission Statistics</span>
            </div>

            <div id="stats-page-content" class="mt-4">
              <div class="skeleton-line" style="width: 100%; height: 260px;"></div>
            </div>
          </div>
        </div>
      `;

      const statsContent = container.querySelector('#stats-page-content');
      let currentChartOption = 'class'; // 'class' | 'shift' | 'groups'

      // Curated vibrant color palette for vertical bars
      const BAR_PALETTE = [
        {
          gradient: 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)',
          text: '#1d4ed8',
          glow: 'rgba(37, 99, 235, 0.25)'
        },
        {
          gradient: 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
          text: '#047857',
          glow: 'rgba(5, 150, 105, 0.25)'
        },
        {
          gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
          text: '#b45309',
          glow: 'rgba(217, 119, 6, 0.25)'
        },
        {
          gradient: 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)',
          text: '#6d28d9',
          glow: 'rgba(124, 58, 237, 0.25)'
        },
        {
          gradient: 'linear-gradient(180deg, #f472b6 0%, #e11d48 100%)',
          text: '#be123c',
          glow: 'rgba(225, 29, 72, 0.25)'
        },
        {
          gradient: 'linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%)',
          text: '#0f766e',
          glow: 'rgba(13, 148, 136, 0.25)'
        }
      ];

      async function loadStatistics() {
        try {
          const summary = await MockApi.getAuthoritySummary();
          const classes = summary.classes || [];

          // Compute Revenue
          let totalRevenue = 0;
          for (const c of classes) {
            const classFee = c.fee || ((c.grade === 'Class 9' || c.grade === 'Class 10') ? 1800 : 1500);
            totalRevenue += ((c.confirmedSeats || 0) * classFee);
          }

          // Build Bar Chart Data based on chosen option with dedicated colors
          function getChartData(option) {
            if (option === 'shift') {
              // Option 2: Distribution based on shifts (Morning vs Day)
              const morningClasses = classes.filter(c => /morning/i.test(c.shift || c.name));
              const dayClasses = classes.filter(c => /day/i.test(c.shift || c.name));

              const morningTotal = morningClasses.reduce((s, c) => s + (c.totalSeats || 0), 0);
              const morningConfirmed = morningClasses.reduce((s, c) => s + (c.confirmedSeats || 0), 0);
              const morningPct = morningTotal > 0 ? Math.round((morningConfirmed / morningTotal) * 100) : 0;

              const dayTotal = dayClasses.reduce((s, c) => s + (c.totalSeats || 0), 0);
              const dayConfirmed = dayClasses.reduce((s, c) => s + (c.confirmedSeats || 0), 0);
              const dayPct = dayTotal > 0 ? Math.round((dayConfirmed / dayTotal) * 100) : 0;

              return [
                {
                  label: 'Morning Shift',
                  confirmed: morningConfirmed,
                  total: morningTotal,
                  pct: morningPct,
                  color: {
                    gradient: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
                    text: '#b45309',
                    glow: 'rgba(217, 119, 6, 0.25)'
                  }
                },
                {
                  label: 'Day Shift',
                  confirmed: dayConfirmed,
                  total: dayTotal,
                  pct: dayPct,
                  color: {
                    gradient: 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)',
                    text: '#1d4ed8',
                    glow: 'rgba(37, 99, 235, 0.25)'
                  }
                }
              ];
            } else if (option === 'groups') {
              // Option 3: Three groups for Class 9 and three groups for Class 10
              const groupConfigs = [
                { grade: 'Class 9', group: 'Science', label: 'Class 9 — Science', colorIndex: 0 },
                { grade: 'Class 9', group: 'Commerce', label: 'Class 9 — Commerce', colorIndex: 1 },
                { grade: 'Class 9', group: 'Arts', label: 'Class 9 — Arts', colorIndex: 2 },
                { grade: 'Class 10', group: 'Science', label: 'Class 10 — Science', colorIndex: 3 },
                { grade: 'Class 10', group: 'Commerce', label: 'Class 10 — Commerce', colorIndex: 5 },
                { grade: 'Class 10', group: 'Arts', label: 'Class 10 — Arts', colorIndex: 4 }
              ];

              return groupConfigs.map(item => {
                const matching = classes.filter(c => {
                  const matchGrade = (c.grade === item.grade) || (c.name && c.name.startsWith(item.grade));
                  const grp = (c.group || '').toLowerCase();
                  let matchGroup = false;
                  if (item.group === 'Arts') {
                    matchGroup = grp.includes('art') || grp.includes('humanities');
                  } else if (item.group === 'Commerce') {
                    matchGroup = grp.includes('commerce') || grp.includes('business');
                  } else {
                    matchGroup = grp.includes(item.group.toLowerCase());
                  }
                  return matchGrade && matchGroup;
                });
                const total = matching.reduce((s, c) => s + (c.totalSeats || 0), 0);
                const confirmed = matching.reduce((s, c) => s + (c.confirmedSeats || 0), 0);
                const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;
                return {
                  label: item.label,
                  confirmed,
                  total,
                  pct,
                  color: BAR_PALETTE[item.colorIndex % BAR_PALETTE.length]
                };
              });
            } else {
              // Option 1 (Default): Student admitted percentage of total seats of each class (merged shifts, classes 6-10 single classes)
              const grades = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
              return grades.map((grade, idx) => {
                const matching = classes.filter(c => (c.grade === grade) || (c.name && c.name.startsWith(grade)));
                const total = matching.reduce((s, c) => s + (c.totalSeats || 0), 0);
                const confirmed = matching.reduce((s, c) => s + (c.confirmedSeats || 0), 0);
                const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;
                return {
                  label: grade,
                  confirmed,
                  total,
                  pct,
                  color: BAR_PALETTE[idx % BAR_PALETTE.length]
                };
              });
            }
          }

          // Render Vertical Bar Chart with Different Colors
          function renderBarsHtml(data) {
            return `
              <div class="v-barchart-wrapper">
                <div class="v-barchart-stage">
                  <!-- Horizontal gridlines -->
                  <div class="v-barchart-grid">
                    <div class="v-grid-line"><span class="v-grid-label">100%</span><div class="v-grid-rule"></div></div>
                    <div class="v-grid-line"><span class="v-grid-label">75%</span><div class="v-grid-rule"></div></div>
                    <div class="v-grid-line"><span class="v-grid-label">50%</span><div class="v-grid-rule"></div></div>
                    <div class="v-grid-line"><span class="v-grid-label">25%</span><div class="v-grid-rule"></div></div>
                    <div class="v-grid-line"><span class="v-grid-label">0%</span><div class="v-grid-rule baseline"></div></div>
                  </div>

                  <!-- Vertical Bars Column Area -->
                  <div class="v-barchart-bars">
                    ${data.map((item, idx) => {
                      const color = item.color || BAR_PALETTE[idx % BAR_PALETTE.length];
                      const pct = item.pct;
                      const countLabel = `${item.confirmed} / ${item.total}`;
                      const heightPct = Math.max(pct, 3);

                      return `
                        <div class="v-bar-col">
                          <!-- Floating stat tag above vertical bar -->
                          <div class="v-bar-top-stat">
                            <span class="v-stat-count font-mono">${countLabel}</span>
                            <span class="v-stat-pct font-bold" style="color: ${color.text};">(${pct}%)</span>
                          </div>

                          <!-- Vertical Pillar Track & Fill Bar -->
                          <div class="v-bar-pillar-wrap barchart-track" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
                            <div class="v-bar-pillar barchart-fill" 
                                 style="height: ${heightPct}%; background: ${color.gradient}; box-shadow: 0 4px 12px ${color.glow};"
                                 title="${Utils.escapeHtml(item.label)}: ${countLabel} Admitted (${pct}%)">
                              ${pct >= 25 ? `<span class="v-bar-inner-pct font-bold font-mono">${pct}%</span>` : ''}
                            </div>
                          </div>

                          <!-- X-axis Label below baseline -->
                          <div class="v-bar-bottom-label">
                            <span class="v-label-title barchart-label">${Utils.escapeHtml(item.label)}</span>
                            <span class="v-label-sub">${item.confirmed} Admitted</span>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            `;
          }

          const chartData = getChartData(currentChartOption);

          statsContent.innerHTML = `
            <!-- 1. Stat boxes in a single line, centered counts, no subtext below counts -->
            <div class="metrics-grid stats-metrics-row mb-8">
              <div class="metric-card">
                <span class="metric-label">Active Classes</span>
                <span class="metric-val text-primary font-bold">${summary.totalClasses}</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Total Capacity</span>
                <span class="metric-val font-bold">${summary.totalCapacity}</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Admitted Students</span>
                <span class="metric-val text-teal font-bold">${summary.totalConfirmed}</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Active Holds</span>
                <span class="metric-val text-amber font-bold">${summary.totalHeld}</span>
              </div>
              <div class="metric-card">
                <span class="metric-label">Available Seats</span>
                <span class="metric-val text-emerald font-bold">${summary.totalAvailable}</span>
              </div>
              <div class="metric-card highlight-revenue">
                <span class="metric-label">Total Revenue</span>
                <span class="metric-val text-emerald font-mono font-bold">৳${totalRevenue.toLocaleString()}</span>
              </div>
            </div>

            <!-- 2. Vertical Bar Chart Section with Selector (Replaces Shift & Grade Quotas) -->
            <div class="authority-card stats-chart-card mb-10">
              <div class="card-header-styled stats-chart-header">
                <div>
                  <h3 class="card-title-styled" style="margin: 0; font-size: 1.15rem; font-weight: 700;">Admission Analytics</h3>
                  <p class="card-subtitle-styled" style="margin: 2px 0 0; font-size: 0.8125rem; color: var(--text-muted);">
                    Live student enrollment capacity and quota occupancy
                  </p>
                </div>
                <div class="stats-chart-selector-box">
                  <label for="stats-chart-selector" class="sr-only">Analytics View</label>
                  <select id="stats-chart-selector" class="form-control form-select">
                    <option value="class" ${currentChartOption === 'class' ? 'selected' : ''}>Admitted % of Total Seat (By Class)</option>
                    <option value="shift" ${currentChartOption === 'shift' ? 'selected' : ''}>Distribution Based on Shifts</option>
                    <option value="groups" ${currentChartOption === 'groups' ? 'selected' : ''}>Discipline Groups (Class 9 &amp; 10)</option>
                  </select>
                </div>
              </div>
              <div class="card-body stats-chart-body-padded p-6" id="stats-chart-body">
                ${renderBarsHtml(chartData)}
              </div>
            </div>

            <!-- 3. Admission Classes Grid Cards (Replaces Table List) -->
            <div class="classes-cards-section mt-10 mb-12">
              <div class="section-header-compact mb-6 flex-between">
                <div>
                  <h3 class="font-bold text-lg" style="margin: 0;">Admission Classes</h3>
                  <p class="text-xs text-muted" style="margin: 2px 0 0;">Configured sections for Session 2027</p>
                </div>
                <span class="badge badge-confirmed font-semibold">${classes.length} Classes Configured</span>
              </div>

              <div class="authority-classes-cards-grid" id="authority-classes-cards-grid">
                ${classes.map(c => {
                  const classFee = c.fee || ((c.grade === 'Class 9' || c.grade === 'Class 10') ? 1800 : 1500);
                  const classRev = (c.confirmedSeats || 0) * classFee;
                  const shiftName = c.shift || 'Morning';
                  const groupName = c.group || 'General';

                  return `
                    <div class="class-summary-card">
                      <div class="class-card-top">
                        <div class="class-card-title-row">
                          <h4 class="class-card-title">${Utils.escapeHtml(c.name)}</h4>
                          <span class="class-fee-badge font-mono">৳${classFee.toLocaleString()}</span>
                        </div>
                        <div class="class-card-pills-row">
                          <span class="badge badge-shift">${Utils.escapeHtml(shiftName)} Shift</span>
                          <span class="badge badge-group">${Utils.escapeHtml(groupName)}</span>
                        </div>
                      </div>

                      <!-- Class Stat Box: total seat, admitted, held, available, and revinew -->
                      <div class="class-stat-box">
                        <div class="class-stat-grid">
                          <div class="class-stat-cell">
                            <span class="class-stat-label">Total Seats</span>
                            <span class="class-stat-num">${c.totalSeats}</span>
                          </div>
                          <div class="class-stat-cell">
                            <span class="class-stat-label">Admitted</span>
                            <span class="class-stat-num text-teal">${c.confirmedSeats}</span>
                          </div>
                          <div class="class-stat-cell">
                            <span class="class-stat-label">Held</span>
                            <span class="class-stat-num text-amber">${c.heldSeats}</span>
                          </div>
                          <div class="class-stat-cell">
                            <span class="class-stat-label">Available</span>
                            <span class="class-stat-num text-emerald">${c.availableSeats}</span>
                          </div>
                        </div>
                        <div class="class-stat-revenue-row">
                          <span class="class-stat-revenue-label">Revenue</span>
                          <span class="class-stat-revenue-val text-emerald font-mono">৳${classRev.toLocaleString()}</span>
                        </div>
                      </div>

                      <div class="class-card-footer">
                        <a href="#/authority/classes/${c.id}" class="btn btn-outline btn-block btn-class-details">
                          Details
                        </a>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;

          // Bind selector change event
          const chartSelector = statsContent.querySelector('#stats-chart-selector');
          if (chartSelector) {
            chartSelector.addEventListener('change', (e) => {
              currentChartOption = e.target.value;
              const newChartData = getChartData(currentChartOption);
              const chartBody = statsContent.querySelector('#stats-chart-body');
              if (chartBody) {
                chartBody.innerHTML = renderBarsHtml(newChartData);
              }
            });
          }

        } catch (err) {
          console.error('Failed to load statistics:', err);
        }
      }

      await loadStatistics();
      activePageInterval = setInterval(loadStatistics, 5000);
    },

    /**
     * Requirement 4: Class Details with Admitted & Reserved Student Rosters
     * When admin clicks on a class:
     * - Shows details of class like counts, lists
     * - When click on admitted or reserved students, it will pop up with students admission details
     */
    async renderAuthorityClassDetailsPage(container, classId) {
      clearActiveTimers();

      container.innerHTML = `
        <div class="authority-portal-wrapper">
          <div class="container authority-body">
            <!-- Breadcrumbs -->
            <div class="page-breadcrumbs mb-4">
              <a href="#/authority/admission-management">Dashboard</a> / 
              <a href="#/authority/statistics">Classes</a> / 
              <span id="detail-breadcrumb-title">Class Details</span>
            </div>

            <div id="class-detail-content-area">
              <div class="skeleton-line" style="width: 100%; height: 200px;"></div>
            </div>
          </div>
        </div>
      `;

      const contentArea = container.querySelector('#class-detail-content-area');
      const breadcrumbTitle = container.querySelector('#detail-breadcrumb-title');

      async function loadClassRoster() {
        try {
          const roster = await MockApi.getClassRoster(classId);
          const { classInfo, admitted, reserved, history } = roster;

          if (breadcrumbTitle) {
            breadcrumbTitle.textContent = classInfo.name;
          }

          const confirmedPct = classInfo.totalSeats > 0 ? (classInfo.confirmedSeats / classInfo.totalSeats) * 100 : 0;
          const heldPct = classInfo.totalSeats > 0 ? (classInfo.heldSeats / classInfo.totalSeats) * 100 : 0;

          contentArea.innerHTML = `
            <!-- Class Summary Banner -->
            <div class="class-detail-hero-card">
              <div class="class-hero-top">
                <div>
                  <h1 class="class-hero-title">${Utils.escapeHtml(classInfo.name)}</h1>
                  <!-- Noticeable class specifications after heading -->
                  <div class="class-noticeable-meta mt-3">
                    <div class="class-noticeable-item">
                      <span class="meta-label">Shift:</span>
                      <strong class="meta-value text-primary">${Utils.escapeHtml(classInfo.shift || 'Morning')} Shift</strong>
                    </div>
                    <div class="class-noticeable-item">
                      <span class="meta-label">Group:</span>
                      <strong class="meta-value text-primary">${Utils.escapeHtml(classInfo.group || 'General')}</strong>
                    </div>
                    <div class="class-noticeable-item">
                      <span class="meta-label">Session:</span>
                      <strong class="meta-value text-primary">${Utils.escapeHtml(classInfo.session || 'Session 27')}</strong>
                    </div>
                    <div class="class-noticeable-item">
                      <span class="meta-label">Fee:</span>
                      <strong class="meta-value text-emerald font-mono">৳${(classInfo.fee || 1500).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quota Counters Matrix (Revenue instead of Utilization) -->
              <div class="class-hero-matrix mt-5">
                <div class="hero-matrix-box">
                  <span class="matrix-box-label">Total Capacity</span>
                  <span class="matrix-box-val">${classInfo.totalSeats}</span>
                </div>
                <div class="hero-matrix-box">
                  <span class="matrix-box-label">Admitted (Confirmed)</span>
                  <span class="matrix-box-val text-teal font-bold">${classInfo.confirmedSeats}</span>
                </div>
                <div class="hero-matrix-box">
                  <span class="matrix-box-label">Reserved (Held)</span>
                  <span class="matrix-box-val text-amber font-bold">${classInfo.heldSeats}</span>
                </div>
                <div class="hero-matrix-box">
                  <span class="matrix-box-label">Available Seats</span>
                  <span class="matrix-box-val text-emerald font-bold">${classInfo.availableSeats}</span>
                </div>
                <div class="hero-matrix-box">
                  <span class="matrix-box-label">Revenue</span>
                  <span class="matrix-box-val text-emerald font-mono font-bold">৳${((classInfo.confirmedSeats || 0) * (classInfo.fee || 1500)).toLocaleString()}</span>
                </div>
              </div>

              <!-- Occupancy Bar -->
              <div class="seat-progress-wrapper mt-4">
                <div class="seat-progress-bar" style="height: 12px;">
                  <div class="progress-segment confirmed" style="width: ${confirmedPct}%" title="Admitted: ${classInfo.confirmedSeats}"></div>
                  <div class="progress-segment held" style="width: ${heldPct}%" title="Held: ${classInfo.heldSeats}"></div>
                </div>
                <div class="seat-progress-legend">
                  <span>${classInfo.availableSeats} seats vacant</span>
                  <span>${classInfo.occupancyRate}% quota occupied</span>
                </div>
              </div>
            </div>

            <!-- Admitted Students Table Section -->
            <div class="authority-card mt-8">
              <div class="card-header-styled flex-between">
                <div>
                  <h3 class="card-title-styled" style="margin: 0;">
                    <span class="badge badge-confirmed">${Utils.icons.checkCircle} ${admitted.length} Admitted</span>
                    Officially Enrolled Students
                  </h3>
                </div>
                <span class="text-xs text-muted">Admission Fee Paid</span>
              </div>

              <div class="table-responsive">
                <table class="authority-table">
                  <thead>
                    <tr>
                      <th>Candidate Birth Registration ID (17-Digit)</th>
                      <th>Application Code</th>
                      <th>Confirmed Timestamp</th>
                      <th>Fee Status</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${!admitted.length ? `
                      <tr>
                        <td colspan="5" class="text-center py-5 text-muted">
                          No students have confirmed admission in this class yet.
                        </td>
                      </tr>
                    ` : admitted.map(s => `
                      <tr class="clickable-student-row" data-hold-id="${s.holdId}" title="Click to view student admission profile">
                        <td class="font-mono font-bold text-primary">
                          <span class="student-row-icon">${Utils.icons.user}</span>
                          ${Utils.escapeHtml(s.studentId)}
                        </td>
                        <td class="font-mono font-semibold">${Utils.escapeHtml(s.applicationCode || s.holdId)}</td>
                        <td class="text-sm">${Utils.formatDate(s.confirmedAt || s.createdAt)}</td>
                        <td>
                          <span class="badge badge-confirmed">${Utils.icons.check} PAID (Simulated)</span>
                        </td>
                        <td class="text-right">
                          <button type="button" class="btn btn-sm btn-outline btn-view-student" data-hold-id="${s.holdId}">
                            View Profile
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Reserved (Held) Students Table Section -->
            <div class="authority-card mt-8">
              <div class="card-header-styled flex-between">
                <div>
                  <h3 class="card-title-styled" style="margin: 0;">
                    <span class="badge badge-held">${Utils.icons.clock} ${reserved.length} Reserved</span>
                    Active Temporary Seat Holds
                  </h3>
                </div>
                <span class="text-xs text-muted">10-Minute Hold Window</span>
              </div>
                <span class="text-xs text-muted">10-Minute Hold Window</span>
              </div>

              <div class="table-responsive">
                <table class="authority-table">
                  <thead>
                    <tr>
                      <th>Candidate Birth Registration ID</th>
                      <th>Application Code</th>
                      <th>Reservation Initiated</th>
                      <th>Time Remaining</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${!reserved.length ? `
                      <tr>
                        <td colspan="5" class="text-center py-5 text-muted">
                          No active temporary seat holds for this class currently.
                        </td>
                      </tr>
                    ` : reserved.map(s => `
                      <tr class="clickable-student-row" data-hold-id="${s.holdId}" title="Click to view student admission profile">
                        <td class="font-mono font-bold text-primary">
                          <span class="student-row-icon">${Utils.icons.user}</span>
                          ${Utils.escapeHtml(s.studentId)}
                        </td>
                        <td class="font-mono font-semibold">${Utils.escapeHtml(s.applicationCode || s.holdId)}</td>
                        <td class="text-sm">${Utils.formatDate(s.createdAt)}</td>
                        <td>
                          <span class="timer-countdown-badge font-mono font-bold text-amber">
                            ${Utils.formatTimeRemaining(s.remainingSeconds)}
                          </span>
                        </td>
                        <td class="text-right">
                          <button type="button" class="btn btn-sm btn-outline btn-view-student" data-hold-id="${s.holdId}">
                            View Profile
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Previous Applications History -->
            ${history.length > 0 ? `
              <div class="authority-card mt-8">
                <div class="card-header-styled">
                  <h3 class="card-title-styled text-muted">Application History (${history.length} Expired / Cancelled)</h3>
                  <p class="card-subtitle-styled">Seats that were previously reserved and released back to open quota</p>
                </div>
                <div class="table-responsive">
                  <table class="authority-table">
                    <thead>
                      <tr>
                        <th>Candidate ID</th>
                        <th>Application Code</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th class="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${history.map(s => `
                        <tr class="clickable-student-row" data-hold-id="${s.holdId}">
                          <td class="font-mono">${Utils.escapeHtml(s.studentId)}</td>
                          <td class="font-mono font-semibold">${Utils.escapeHtml(s.applicationCode || s.holdId)}</td>
                          <td>
                            <span class="badge ${s.status === 'EXPIRED' ? 'badge-expired' : 'badge-cancelled'}">
                              ${s.status}
                            </span>
                          </td>
                          <td class="text-sm text-muted">${Utils.formatDate(s.createdAt)}</td>
                          <td class="text-right">
                            <button type="button" class="btn btn-sm btn-outline btn-view-student" data-hold-id="${s.holdId}">
                              View Profile
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}
          `;

          // Bind clicking on student rows or buttons to open popup
          const studentRows = contentArea.querySelectorAll('.clickable-student-row, .btn-view-student');
          studentRows.forEach(el => {
            el.addEventListener('click', async (e) => {
              e.stopPropagation();
              const holdId = el.getAttribute('data-hold-id');
              if (!holdId) return;

              try {
                const studentDetail = await MockApi.getStudentAdmissionDetail(holdId);
                Components.showAdminStudentDetailsModal(studentDetail);
              } catch (err) {
                Components.showToast('Could not load student record.', 'error');
              }
            });
          });

        } catch (err) {
          contentArea.innerHTML = Components.renderEmptyState({
            icon: Utils.icons.alertTriangle,
            title: 'Class Not Found',
            description: `Could not locate admission class "${classId}".`,
            actionText: 'Back to Classes',
            actionHref: '#/authority/classes'
          });
        }
      }

      await loadClassRoster();
      activePageInterval = setInterval(loadClassRoster, 5000);
    }
  };

  window.Pages = Pages;
})(window);

