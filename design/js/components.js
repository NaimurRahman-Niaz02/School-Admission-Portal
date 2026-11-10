/**
 * components.js - Shared UI components, Modals, Toasts, and Presentation Helpers
 * Hashmat Uddin High School Admission Portal
 */

(function (window) {
  'use strict';

  const Components = {
    /**
     * Toast Notification
     */
    showToast(message, type = 'info', duration = 4000) {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast-item toast-${type}`;
      toast.setAttribute('role', 'status');

      let iconSvg = Utils.icons.info;
      if (type === 'success') iconSvg = Utils.icons.checkCircle;
      else if (type === 'error') iconSvg = Utils.icons.alertCircle;
      else if (type === 'warning') iconSvg = Utils.icons.alertTriangle;

      toast.innerHTML = `
        <div class="toast-icon">${iconSvg}</div>
        <div class="toast-content">${Utils.escapeHtml(message)}</div>
        <button class="toast-close" aria-label="Dismiss notification">
          ${Utils.icons.close}
        </button>
      `;

      const closeBtn = toast.querySelector('.toast-close');
      const dismiss = () => {
        toast.classList.add('toast-exit');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 250);
      };

      if (closeBtn) {
        closeBtn.addEventListener('click', dismiss);
      }
      container.appendChild(toast);

      // Trigger animation
      requestAnimationFrame(() => toast.classList.add('toast-enter'));

      if (duration > 0) {
        setTimeout(dismiss, duration);
      }
    },

    /**
     * Modal Dialog System
     */
    openModal({ title, content, buttons = [], onClose = null }) {
      this.closeModal();

      const backdrop = document.createElement('div');
      backdrop.id = 'modal-backdrop';
      backdrop.className = 'modal-backdrop';

      const dialog = document.createElement('div');
      dialog.className = 'modal-dialog';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('aria-labelledby', 'modal-title');

      let buttonsHtml = '';
      if (buttons && buttons.length) {
        buttonsHtml = `<div class="modal-footer">
          ${buttons.map((btn, idx) => `
            <button type="button" class="btn ${btn.className || 'btn-secondary'}" data-btn-idx="${idx}">
              ${Utils.escapeHtml(btn.label)}
            </button>
          `).join('')}
        </div>`;
      }

      dialog.innerHTML = `
        <div class="modal-header">
          <h2 id="modal-title" class="modal-title">${Utils.escapeHtml(title)}</h2>
          <button type="button" class="modal-close" aria-label="Close dialog">
            ${Utils.icons.close}
          </button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${buttonsHtml}
      `;

      backdrop.appendChild(dialog);
      document.body.appendChild(backdrop);
      document.body.classList.add('modal-open');

      const handleClose = () => {
        if (onClose) onClose();
        this.closeModal();
      };

      // Close button
      dialog.querySelector('.modal-close').addEventListener('click', handleClose);

      // Backdrop click outside dialog closes
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          handleClose();
        }
      });

      // Escape key listener
      const keyHandler = (e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };
      document.addEventListener('keydown', keyHandler);
      backdrop._keyHandler = keyHandler;

      // Bind button events
      const btnEls = dialog.querySelectorAll('[data-btn-idx]');
      btnEls.forEach(btnEl => {
        const idx = parseInt(btnEl.getAttribute('data-btn-idx'), 10);
        const btnDef = buttons[idx];
        if (btnDef && btnDef.onClick) {
          btnEl.addEventListener('click', (e) => {
            btnDef.onClick(e, dialog);
          });
        }
      });

      // Trigger CSS enter animation
      requestAnimationFrame(() => {
        backdrop.classList.add('modal-visible');
        const firstInput = dialog.querySelector('input:not([type=hidden]), button.btn-primary');
        if (firstInput) firstInput.focus();
      });

      return dialog;
    },

    closeModal() {
      const backdrop = document.getElementById('modal-backdrop');
      if (backdrop) {
        if (backdrop._keyHandler) {
          document.removeEventListener('keydown', backdrop._keyHandler);
        }
        backdrop.classList.remove('modal-visible');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
          if (backdrop.parentNode) {
            backdrop.parentNode.removeChild(backdrop);
          }
        }, 200);
      }
    },

    /**
     * Shared Student Identity Dialog
     */
    showStudentIdentityModal({ onSave, onCancel, currentId = '', titleText = 'Student Identification' }) {
      const currentVal = currentId || AppState.studentId || '';
      const isRemembered = AppState.rememberStudent;

      const content = `
        <p class="modal-intro">
          Please enter your official <strong>17-digit birth registration number</strong> to access reservations and track applications.
        </p>
        <div class="form-group">
          <label for="student-id-input" class="form-label">Birth Registration Number (17 digits)</label>
          <div class="input-with-counter">
            <input
              type="text"
              id="student-id-input"
              class="form-control font-mono"
              placeholder="e.g. 20081234567890123"
              value="${Utils.escapeHtml(currentVal)}"
              maxlength="17"
              autocomplete="off"
              inputmode="numeric"
              pattern="[0-9]*"
            />
            <div id="student-id-counter" class="input-counter">${currentVal.length}/17</div>
          </div>
          <div id="student-id-error" class="form-error" style="display: none;"></div>
          <p class="form-hint">
            Must contain exactly 17 numeric digits with no spaces or special characters.
          </p>
        </div>

        <div class="form-preview-box">
          <span class="preview-label">Masked Public Preview:</span>
          <span id="student-id-preview" class="preview-value font-mono">
            ${currentVal ? Utils.maskStudentId(currentVal) : '•••• •••• •••• ••••'}
          </span>
        </div>

        <div class="form-check mt-3">
          <input
            type="checkbox"
            id="remember-student-check"
            class="form-check-input"
            ${isRemembered ? 'checked' : ''}
          />
          <label for="remember-student-check" class="form-check-label">
            Remember this student on this browser
          </label>
        </div>
      `;

      const dialog = this.openModal({
        title: titleText,
        content,
        buttons: [
          {
            label: 'Cancel',
            className: 'btn-secondary',
            onClick: () => {
              if (onCancel) onCancel();
              this.closeModal();
            }
          },
          {
            label: 'Continue',
            className: 'btn-primary',
            onClick: async (e, d) => {
              const input = d.querySelector('#student-id-input');
              const errorEl = d.querySelector('#student-id-error');
              const rememberCheck = d.querySelector('#remember-student-check');
              const val = (input.value || '').trim();

              if (!val) {
                errorEl.textContent = 'Please enter your 17-digit birth registration number.';
                errorEl.style.display = 'block';
                input.focus();
                return;
              }

              if (!Utils.isValid17DigitId(val)) {
                errorEl.textContent = `Invalid format: Entered ${val.length} digits. Exactly 17 numeric digits are required.`;
                errorEl.style.display = 'block';
                input.focus();
                return;
              }

              errorEl.style.display = 'none';
              const remember = rememberCheck.checked;

              try {
                await AppState.setStudentId(val, remember);
                Components.showToast('Student identification verified and set.', 'success');
                this.closeModal();
                if (onSave) onSave(val);
              } catch (err) {
                errorEl.textContent = err.message || 'Failed to set student ID.';
                errorEl.style.display = 'block';
              }
            }
          }
        ],
        onClose: onCancel
      });

      // Bind input formatting & real-time counter
      const input = dialog.querySelector('#student-id-input');
      const counter = dialog.querySelector('#student-id-counter');
      const preview = dialog.querySelector('#student-id-preview');
      const errorEl = dialog.querySelector('#student-id-error');

      input.addEventListener('input', (e) => {
        // Strip non-digits
        const cleaned = e.target.value.replace(/\D/g, '').slice(0, 17);
        if (e.target.value !== cleaned) {
          e.target.value = cleaned;
        }

        counter.textContent = `${cleaned.length}/17`;
        if (cleaned.length === 17) {
          counter.classList.add('counter-valid');
          preview.textContent = Utils.maskStudentId(cleaned);
          errorEl.style.display = 'none';
        } else {
          counter.classList.remove('counter-valid');
          preview.textContent = cleaned.length > 0 ? Utils.maskStudentId(cleaned) : '•••• •••• •••• ••••';
        }
      });
    },

    /**
     * Simulated Payment Confirmation Dialog
     */
    showPaymentModal({ hold, onConfirm, onCancel }) {
      const classFee = hold.classInfo?.fee || hold.fee || 1500;

      const content = `
        <div class="payment-modal-content">
          <div class="payment-summary-card">
            <div class="payment-row">
              <span class="text-muted">Application Code:</span>
              <span class="font-mono font-semibold">${Utils.escapeHtml(hold.applicationCode || hold.holdId)}</span>
            </div>
            <div class="payment-row">
              <span class="text-muted">Selected Class:</span>
              <span class="font-semibold">${Utils.escapeHtml(hold.className)}</span>
            </div>
            <div class="payment-row">
              <span class="text-muted">Student ID:</span>
              <span class="font-mono">${Utils.maskStudentId(hold.studentId)}</span>
            </div>
            <div class="payment-divider"></div>
            <div class="payment-row total-row">
              <span class="font-semibold">Admission Fee:</span>
              <span class="fee-amount">৳${classFee}</span>
            </div>
          </div>
        </div>
      `;

      this.openModal({
        title: 'Confirm Admission Payment',
        content,
        buttons: [
          {
            label: 'Go Back',
            className: 'btn-secondary',
            onClick: () => {
              if (onCancel) onCancel();
              this.closeModal();
            }
          },
          {
            label: 'Confirm Payment & Finalize Admission',
            className: 'btn-success',
            onClick: async (e) => {
              const btn = e.target;
              btn.disabled = true;
              btn.innerHTML = `<span class="spinner-sm"></span> Processing Confirmation...`;
              try {
                await onConfirm();
                this.closeModal();
              } catch (err) {
                btn.disabled = false;
                btn.innerHTML = 'Confirm Payment & Finalize Admission';
                Components.showToast(err.message || 'Payment simulation failed.', 'error');
              }
            }
          }
        ],
        onClose: onCancel
      });
    },

    /**
     * Cancel Reservation Dialog
     */
    showCancelModal({ hold, onConfirm, onCancel }) {
      const content = `
        <div class="cancel-modal-content">
          <p>
            Are you sure you want to cancel your seat reservation for <strong>${Utils.escapeHtml(hold.className)}</strong>?
          </p>
          <div class="alert alert-warning mt-2">
            <div class="alert-icon">${Utils.icons.alertTriangle}</div>
            <div class="alert-body">
              The held seat will be immediately released and returned to the school's available pool for other students to reserve.
            </div>
          </div>
        </div>
      `;

      this.openModal({
        title: 'Cancel Seat Reservation',
        content,
        buttons: [
          {
            label: 'Keep Reservation',
            className: 'btn-secondary',
            onClick: () => {
              if (onCancel) onCancel();
              this.closeModal();
            }
          },
          {
            label: 'Yes, Cancel Reservation',
            className: 'btn-danger',
            onClick: async (e) => {
              const btn = e.target;
              btn.disabled = true;
              btn.innerHTML = `<span class="spinner-sm"></span> Cancelling...`;
              try {
                await onConfirm();
                this.closeModal();
              } catch (err) {
                btn.disabled = false;
                btn.innerHTML = 'Yes, Cancel Reservation';
                Components.showToast(err.message || 'Failed to cancel reservation.', 'error');
              }
            }
          }
        ],
        onClose: onCancel
      });
    },

    /**
     * Public Navbar Rendering
     */
    renderNavbar(activeRoute = '#/') {
      const studentId = AppState.studentId;
      const isHome = activeRoute === '#/' || activeRoute === '';
      const isClasses = activeRoute.startsWith('#/admissions/classes');
      const isInfo = activeRoute.startsWith('#/admission-info');
      const isMyApps = activeRoute.startsWith('#/my-applications');

      let studentPillHtml = '';
      if (studentId) {
        studentPillHtml = `
          <div class="student-identity-pill" title="Active Student: ${studentId}">
            <span class="student-pill-icon">${Utils.icons.user}</span>
            <span class="student-pill-id font-mono">${Utils.maskStudentId(studentId)}</span>
            <button type="button" class="btn-change-id-btn" id="nav-btn-change-id" title="Change Student ID">
              ${Utils.icons.edit} <span>Change</span>
            </button>
          </div>
        `;
      } else {
        studentPillHtml = `
          <button type="button" class="btn-set-id" id="nav-btn-set-id">
            <span class="btn-set-icon">${Utils.icons.user}</span>
            <span>Set Student ID</span>
          </button>
        `;
      }

      return `
        <header class="site-header">
          <div class="container header-container">
            <!-- Brand -->
            <a href="#/" class="brand-link" aria-label="Hashmat Uddin High School Home">
              <span class="brand-crest">${Utils.icons.logo}</span>
              <div class="brand-text">
                <span class="brand-name">Hashmat Uddin High School</span>
                <span class="brand-location">Nagua, Sadar, Kishoregong</span>
              </div>
            </a>

            <!-- Mobile Hamburger Toggle -->
            <button class="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Toggle navigation menu">
              ${Utils.icons.menu}
            </button>

            <!-- Navigation Links -->
            <nav class="site-nav" id="site-nav" aria-label="Main Navigation">
              <ul class="nav-list">
                <li class="nav-item">
                  <a href="#/" class="nav-link ${isHome ? 'active' : ''}">Home</a>
                </li>
                <li class="nav-item">
                  <a href="#/admissions/classes" class="nav-link ${isClasses ? 'active' : ''}">Admission</a>
                </li>
                <li class="nav-item">
                  <a href="#/admission-info" class="nav-link ${isInfo ? 'active' : ''}">Info</a>
                </li>
                <li class="nav-item">
                  <a href="#/my-applications" class="nav-link ${isMyApps ? 'active' : ''}">My Applications</a>
                </li>
              </ul>

              <!-- Student Area -->
              <div class="nav-student-area">
                ${studentPillHtml}
              </div>
            </nav>
          </div>
        </header>
      `;
    },

    /**
     * Bind Navbar Event Listeners
     */
    bindNavbarEvents() {
      const toggleBtn = document.getElementById('mobile-nav-toggle');
      const nav = document.getElementById('site-nav');
      if (toggleBtn && nav) {
        toggleBtn.addEventListener('click', () => {
          nav.classList.toggle('nav-open');
        });

        // Close mobile drawer when a nav link is clicked
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
          link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
          });
        });
      }

      const changeIdBtn = document.getElementById('nav-btn-change-id');
      if (changeIdBtn) {
        changeIdBtn.addEventListener('click', () => {
          Components.showStudentIdentityModal({
            titleText: 'Change Student ID',
            onSave: () => {
              if (window.Router) window.Router.refreshCurrentPage();
            }
          });
        });
      }

      const setIdBtn = document.getElementById('nav-btn-set-id');
      if (setIdBtn) {
        setIdBtn.addEventListener('click', () => {
          Components.showStudentIdentityModal({
            titleText: 'Set Student Identification',
            onSave: () => {
              if (window.Router) window.Router.refreshCurrentPage();
            }
          });
        });
      }
    },

    /**
     * Public Footer Rendering (Strictly no admin links)
     */
    renderFooter() {
      return `
        <footer class="site-footer">
          <div class="container footer-container">
            <div class="footer-grid">
              <!-- Col 1: About -->
              <div class="footer-col footer-col-brand">
                <div class="footer-brand">
                  <span class="footer-crest">${Utils.icons.logo}</span>
                  <span class="footer-school-name">Hashmat Uddin High School</span>
                </div>
                <p class="footer-desc">
                  Providing premier secondary education with a commitment to academic excellence, discipline, and ethical leadership.
                </p>
                <div class="footer-badge">
                  <span>Academic Session 27 (2026–2027)</span>
                </div>
              </div>

              <!-- Col 2: Useful Public Links -->
              <div class="footer-col">
                <h4 class="footer-heading">Admission Navigation</h4>
                <ul class="footer-links">
                  <li><a href="#/">Portal Home</a></li>
                  <li><a href="#/admissions/classes">Available Classes</a></li>
                  <li><a href="#/admission-info">Admission Information</a></li>
                  <li><a href="#/my-applications">Track My Applications</a></li>
                  <li><a href="#/" onclick="setTimeout(()=>document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'}), 100); return false;">Admission Process</a></li>
                  <li><a href="#/" onclick="setTimeout(()=>document.getElementById('guidelines')?.scrollIntoView({behavior:'smooth'}), 100); return false;">Admission Guidelines</a></li>
                </ul>
              </div>

              <!-- Col 3: Contact & Campus Info -->
              <div class="footer-col">
                <h4 class="footer-heading">Campus Admission Office</h4>
                <address class="footer-address">
                  <p>Hashmat Uddin High School</p>
                  <p>Campus Road, Academic District</p>
                  <p>Email: admissions@hashmatuddin.edu.bd</p>
                  <p>Phone: +880 1711-000000 / +880 1811-000000</p>
                  <p>Hours: Mon – Thu, 8:30 AM – 3:30 PM</p>
                </address>
              </div>
            </div>

            <div class="footer-bottom">
              <p class="copyright-text">
                &copy; 2026 Hashmat Uddin High School. All rights reserved.
              </p>
              <p class="footer-tech-note text-muted">
                First-Come, First-Served Seat Allocation System
              </p>
            </div>
          </div>
        </footer>
      `;
    },

    /**
     * Authority Portal Header
     */
    renderAuthorityHeader(currentRoute = '#/authority/admission-management') {
      const isDashboard = currentRoute === '#/authority/admission-management' || currentRoute === '#/authority/dashboard';
      const isCreateClass = currentRoute === '#/authority/create-class';
      const isStats = currentRoute === '#/authority/statistics' || currentRoute.startsWith('#/authority/classes');

      return `
        <header class="authority-header">
          <div class="container authority-header-container">
            <!-- Left: Logo & Location (matching student portal) -->
            <a href="#/authority/admission-management" class="brand-link" aria-label="Hashmat Uddin High School Authority Portal">
              <span class="brand-crest">${Utils.icons.logo}</span>
              <div class="brand-text">
                <span class="brand-name">Hashmat Uddin High School</span>
                <span class="brand-location">Nagua, Sadar, Kishoregong</span>
              </div>
            </a>

            <!-- Middle: Page Navigations -->
            <nav class="authority-nav authority-nav-center" aria-label="Authority Navigation">
              <a href="#/authority/admission-management" class="auth-nav-link ${isDashboard ? 'active' : ''}">
                Dashboard
              </a>
              <a href="#/authority/create-class" class="auth-nav-link ${isCreateClass ? 'active' : ''}">
                New Class
              </a>
              <a href="#/authority/statistics" class="auth-nav-link ${isStats ? 'active' : ''}">
                Statistics
              </a>
            </nav>

            <!-- Right: Actions -->
            <div class="authority-actions">
              <button type="button" class="btn btn-outline-light btn-sm" id="btn-admin-logout" title="Sign out of administration">
                Sign Out
              </button>
              <a href="#/" class="btn btn-outline-light btn-sm">
                Student Portal
              </a>
            </div>
          </div>
        </header>
      `;
    },

    /**
     * Bind Authority Header Events (Sign Out)
     */
    bindAuthorityHeaderEvents() {
      const logoutBtn = document.getElementById('btn-admin-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
          await MockApi.logoutAdmin();
          Components.showToast('Signed out of administration.', 'info');
          if (window.Router) {
            window.Router.handleRouting();
          }
        });
      }
    },

    /**
     * Modal: Update Admission Time Schedule (Session 2027)
     */
    showUpdateAdmissionTimeModal({ currentTimeline, onSave }) {
      const startIso = currentTimeline?.startDate || '2026-11-01T08:00:00.000Z';
      const endIso = currentTimeline?.endDate || '2026-11-30T23:59:59.000Z';

      const formatForInput = (isoStr) => {
        try {
          const d = new Date(isoStr);
          const pad = n => String(n).padStart(2, '0');
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        } catch (e) {
          return '';
        }
      };

      const content = `
        <div class="update-timeline-modal-body">
          <div class="form-group mb-4">
            <label class="form-label" for="timeline-start-input">
              ${Utils.icons.clock} Admission Start Date &amp; Time
            </label>
            <input
              type="datetime-local"
              id="timeline-start-input"
              class="form-control"
              value="${formatForInput(startIso)}"
            />
          </div>

          <div class="form-group mb-4">
            <label class="form-label" for="timeline-end-input">
              ${Utils.icons.clock} Admission Closing Date &amp; Time
            </label>
            <input
              type="datetime-local"
              id="timeline-end-input"
              class="form-control"
              value="${formatForInput(endIso)}"
            />
          </div>

          <div id="timeline-modal-error" class="form-error-msg" style="display: none; color: #ef4444; font-size: 0.8125rem; margin-top: 8px;"></div>
        </div>
      `;

      this.openModal({
        title: 'Update Admission Time — Session 2027',
        content,
        buttons: [
          {
            label: 'Cancel',
            className: 'btn-secondary',
            onClick: () => {
              this.closeModal();
            }
          },
          {
            label: 'Save Admission Time',
            className: 'btn-primary',
            onClick: async () => {
              const startVal = document.getElementById('timeline-start-input')?.value;
              const endVal = document.getElementById('timeline-end-input')?.value;
              const errEl = document.getElementById('timeline-modal-error');

              if (!startVal || !endVal) {
                if (errEl) {
                  errEl.textContent = 'Please specify both start and closing dates/times.';
                  errEl.style.display = 'block';
                }
                return;
              }

              const startDate = new Date(startVal);
              const endDate = new Date(endVal);

              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                if (errEl) {
                  errEl.textContent = 'Invalid date/time format entered.';
                  errEl.style.display = 'block';
                }
                return;
              }

              if (endDate.getTime() <= startDate.getTime()) {
                if (errEl) {
                  errEl.textContent = 'Closing date must be after the start date.';
                  errEl.style.display = 'block';
                }
                return;
              }

              const res = await MockApi.updateAdmissionTimeline({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
              });

              Components.showToast('Admission schedule updated for Session 2027.', 'success');
              this.closeModal();
              if (onSave) onSave(res.timeline);
            }
          }
        ]
      });
    },

    /**
     * Modal: Detailed Student Admission Record (Requirement 4)
     * Pops up when clicking on admitted or reserved students in Class Details
     */
    showAdminStudentDetailsModal(student) {
      const isConfirmed = student.status === 'CONFIRMED';
      const isHeld = student.status === 'HELD';
      const isExpired = student.status === 'EXPIRED';

      let statusBadge = '';
      if (isConfirmed) {
        statusBadge = `<span class="badge badge-confirmed">${Utils.icons.checkCircle} CONFIRMED ADMISSION</span>`;
      } else if (isHeld) {
        statusBadge = `<span class="badge badge-held">${Utils.icons.clock} ACTIVE SEAT HOLD</span>`;
      } else if (isExpired) {
        statusBadge = `<span class="badge badge-expired">${Utils.icons.alertCircle} EXPIRED HOLD</span>`;
      } else {
        statusBadge = `<span class="badge badge-cancelled">${Utils.icons.close} ${student.status}</span>`;
      }

      const content = `
        <div class="admin-student-profile-dialog">
          <div class="profile-status-header">
            <div class="profile-avatar">
              ${Utils.icons.user}
            </div>
            <div class="profile-title-col">
              <div class="profile-badge-row">${statusBadge}</div>
              <h3 class="profile-student-name">Student Birth Registration Record</h3>
              <p class="profile-student-id font-mono">${Utils.escapeHtml(student.studentId)}</p>
            </div>
          </div>

          <div class="profile-grid">
            <div class="profile-item">
              <span class="profile-item-lbl">Application Code</span>
              <span class="profile-item-val font-mono font-bold">${Utils.escapeHtml(student.applicationCode || student.holdId)}</span>
            </div>
            <div class="profile-item">
              <span class="profile-item-lbl">Academic Session</span>
              <span class="profile-item-val font-semibold">${Utils.escapeHtml(student.session || 'Session 27')}</span>
            </div>
            <div class="profile-item">
              <span class="profile-item-lbl">Allocated Class</span>
              <span class="profile-item-val font-semibold text-primary">${Utils.escapeHtml(student.className || student.classInfo?.name || 'Class')}</span>
            </div>
            <div class="profile-item">
              <span class="profile-item-lbl">Grade &amp; Shift</span>
              <span class="profile-item-val">${Utils.escapeHtml(student.grade || '—')} &bull; ${Utils.escapeHtml(student.shift || '—')} Shift</span>
            </div>
            <div class="profile-item">
              <span class="profile-item-lbl">Discipline Group</span>
              <span class="profile-item-val font-semibold">${Utils.escapeHtml(student.group || 'General')}</span>
            </div>
            <div class="profile-item">
              <span class="profile-item-lbl">Admission Fee Status</span>
              <span class="profile-item-val ${isConfirmed ? 'text-emerald font-bold' : 'text-amber font-semibold'}">
                ${isConfirmed ? 'PAID (Simulated Confirmation)' : 'PENDING PAYMENT'}
              </span>
            </div>
            <div class="profile-item">
              <span class="profile-item-lbl">Reservation Initiated</span>
              <span class="profile-item-val text-sm">${Utils.formatDate(student.createdAt)}</span>
            </div>
            <div class="profile-item">
              <span class="profile-item-lbl">${isConfirmed ? 'Confirmation Date' : 'Reservation Expiration'}</span>
              <span class="profile-item-val text-sm font-semibold">
                ${isConfirmed ? Utils.formatDate(student.confirmedAt) : Utils.formatDate(student.expiresAt)}
              </span>
            </div>
          </div>

          ${isHeld ? `
            <div class="alert alert-warning mt-3">
              <div class="alert-icon">${Utils.icons.clock}</div>
              <div class="alert-body">
                <strong>Temporary Seat Lock:</strong> This candidate's seat is currently held. If not confirmed, the seat will auto-release back to open quota.
              </div>
            </div>
          ` : ''}

          ${isConfirmed ? `
            <div class="alert alert-success mt-3">
              <div class="alert-icon">${Utils.icons.checkCircle}</div>
              <div class="alert-body">
                <strong>Officially Enrolled:</strong> Candidate seat quota is confirmed and locked for Academic Session 2026–2027.
              </div>
            </div>
          ` : ''}
        </div>
      `;

      this.openModal({
        title: 'Student Admission Profile',
        content,
        buttons: [
          {
            label: 'Copy 17-Digit ID',
            className: 'btn-secondary',
            onClick: () => {
              navigator.clipboard?.writeText(student.studentId);
              Components.showToast('Student ID copied to clipboard.', 'info', 2500);
            }
          },
          {
            label: 'Close Record',
            className: 'btn-primary',
            onClick: () => {
              this.closeModal();
            }
          }
        ]
      });
    },

    /**
     * Class Card Component
     */
    renderClassCard(classItem, studentState) {
      const { id, name, grade, shift, group, totalSeats, availableSeats, status, fee } = classItem;

      // Status pill styling
      let statusClass = 'pill-available';
      let statusLabel = 'Available';
      if (status === 'Full' || availableSeats <= 0) {
        statusClass = 'pill-full';
        statusLabel = 'Class Full';
      } else if (status === 'Limited Seats') {
        statusClass = 'pill-limited';
        statusLabel = 'Limited Seats';
      }

      // Check student admission restrictions for button
      let buttonHtml = '';
      const isFull = availableSeats <= 0;

      if (studentState.admissionState === 'CONFIRMED') {
        buttonHtml = `
          <a href="#/my-applications" class="btn btn-secondary btn-block" title="You already have confirmed admission">
            Admission Confirmed
          </a>
        `;
      } else if (studentState.admissionState === 'HELD') {
        const isCurrentHeldClass = studentState.currentApplication && studentState.currentApplication.classId === id;
        if (isCurrentHeldClass) {
          buttonHtml = `
            <a href="#/applications/${studentState.currentApplication.holdId}" class="btn btn-warning btn-block">
              View Your Hold (${studentState.currentApplication.remainingSeconds ? Utils.formatTimeRemaining(studentState.currentApplication.remainingSeconds) : 'Active'})
            </a>
          `;
        } else {
          buttonHtml = `
            <a href="#/admissions/classes/${id}" class="btn btn-outline btn-block" title="View details of this class">
              View Class Details &rarr;
            </a>
          `;
        }
      } else if (isFull) {
        buttonHtml = `
          <a href="#/admissions/classes/${id}" class="btn btn-secondary btn-block">
            Class Full (Details)
          </a>
        `;
      } else {
        buttonHtml = `
          <a href="#/admissions/classes/${id}" class="btn btn-primary btn-block">
            Select This Class ${Utils.icons.arrowRight}
          </a>
        `;
      }

      const isHigherGrade = grade === 'Class 9' || grade === 'Class 10';
      const displayGroup = group || (isHigherGrade ? 'Science' : null);
      const displayShift = shift || (/day/i.test(name) ? 'Day' : 'Morning');

      return `
        <article class="class-card ${isFull ? 'class-card-full' : ''}" data-class-id="${id}">
          <div class="class-card-header">
            <h3 class="class-card-title">${Utils.escapeHtml(name)}</h3>
            <span class="availability-pill ${statusClass}">
              <span class="pill-dot"></span>
              ${statusLabel}
            </span>
          </div>

          <!-- Shift on left, Group (only for 9 and 10) on right, both bold in different colors -->
          <div class="card-meta-line">
            <span class="card-meta-shift font-bold">${Utils.escapeHtml(displayShift)} Shift</span>
            ${isHigherGrade && displayGroup ? `
              <span class="card-meta-group font-bold">${Utils.escapeHtml(displayGroup)} Group</span>
            ` : `<span></span>`}
          </div>

          <!-- Clean Seat Matrix: ONLY Total & Available (dont write available seat) -->
          <div class="class-seat-matrix two-cols">
            <div class="matrix-item">
              <span class="matrix-val font-bold">${totalSeats}</span>
              <span class="matrix-lbl font-semibold">Total</span>
            </div>
            <div class="matrix-item is-available">
              <span class="matrix-val text-emerald font-bold available-number">${availableSeats}</span>
              <span class="matrix-lbl font-semibold text-emerald">Available</span>
            </div>
          </div>

          <div class="class-card-actions mt-3">
            ${buttonHtml}
          </div>
        </article>
      `;
    },

    /**
     * Empty State Component
     */
    renderEmptyState({ icon, title, description, actionText = null, actionHref = null, actionId = null }) {
      const actionHtml = actionText && (actionHref || actionId)
        ? `<div class="empty-state-actions">
            <a ${actionHref ? `href="${actionHref}"` : ''} ${actionId ? `id="${actionId}"` : ''} class="btn btn-primary">
              ${Utils.escapeHtml(actionText)}
            </a>
          </div>`
        : '';

      return `
        <div class="empty-state-box">
          <div class="empty-state-icon">
            ${icon || Utils.icons.info}
          </div>
          <h3 class="empty-state-title">${Utils.escapeHtml(title)}</h3>
          <p class="empty-state-description">${Utils.escapeHtml(description)}</p>
          ${actionHtml}
        </div>
      `;
    },

    /**
     * Skeleton Loading Component for Class Cards
     */
    renderClassSkeletons(count = 6) {
      return Array.from({ length: count }).map(() => `
        <div class="class-card skeleton-card">
          <div class="skeleton-line" style="width: 30%; height: 20px; margin-bottom: 12px;"></div>
          <div class="skeleton-line" style="width: 70%; height: 28px; margin-bottom: 24px;"></div>
          <div class="skeleton-line" style="width: 100%; height: 50px; margin-bottom: 16px;"></div>
          <div class="skeleton-line" style="width: 100%; height: 12px; margin-bottom: 24px;"></div>
          <div class="skeleton-line" style="width: 100%; height: 42px;"></div>
        </div>
      `).join('');
    }
  };

  window.Components = Components;
})(window);

