/**
 * app.js - Application Entry Point and Global Lifecycle Orchestrator
 * Hashmat Uddin High School Admission Portal
 */

(function (window) {
  'use strict';

  async function bootstrapApp() {
    console.log('Initializing Hashmat Uddin High School Admission Portal...');

    // 1. Initialize persistent storage layer and seed data
    Store.init();

    // 2. Initialize reactive application state
    await AppState.init();

    // 3. React to state changes across components
    AppState.subscribe((state) => {
      // Re-render navbar identity indicator if present
      const navStudentArea = document.querySelector('.nav-student-area');
      if (navStudentArea) {
        if (state.studentId) {
          navStudentArea.innerHTML = `
            <div class="student-identity-pill" title="Active Student: ${state.studentId}">
              <span class="student-pill-icon">${Utils.icons.user}</span>
              <span class="student-pill-id font-mono">${Utils.maskStudentId(state.studentId)}</span>
              <button type="button" class="btn-change-id-btn" id="nav-btn-change-id" title="Change Student ID">
                ${Utils.icons.edit} <span>Change</span>
              </button>
            </div>
          `;
        } else {
          navStudentArea.innerHTML = `
            <button type="button" class="btn-set-id" id="nav-btn-set-id">
              <span class="btn-set-icon">${Utils.icons.user}</span>
              <span>Set Student ID</span>
            </button>
          `;
        }
        Components.bindNavbarEvents();
      }
    });

    // 4. Initialize client router
    Router.init();

    // 5. Global background hold expiration runner (runs every 2 seconds)
    setInterval(async () => {
      const expiredCount = Store.expireHolds();
      if (expiredCount) {
        await AppState.refreshAdmissionState();
      }
    }, 2000);

    // 6. Multi-tab synchronization via localStorage events
    window.addEventListener('storage', async (e) => {
      if (e.key && e.key.startsWith('gia_')) {
        await AppState.refreshAdmissionState();
        if (window.Router) {
          window.Router.refreshCurrentPage();
        }
      }
    });
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapApp);
  } else {
    bootstrapApp();
  }
})(window);

