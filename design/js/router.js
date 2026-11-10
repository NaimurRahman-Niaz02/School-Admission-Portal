/**
 * router.js - Hash-based Client-Side Router
 * Hashmat Uddin High School Admission Portal
 */

(function (window) {
  'use strict';

  const Router = {
    currentRoute: '',
    currentParams: {},

    init() {
      window.addEventListener('hashchange', () => this.handleRouting());
      window.addEventListener('load', () => this.handleRouting());

      // If initial hash is empty, set to #/
      if (!window.location.hash) {
        window.location.hash = '#/';
      }
    },

    /**
     * Parse hash and match routes
     */
    async handleRouting() {
      let rawHash = window.location.hash || '#/';
      // Strip query parameters for matching if appended inside hash
      const queryIdx = rawHash.indexOf('?');
      let path = queryIdx !== -1 ? rawHash.substring(0, queryIdx) : rawHash;

      // Clean trailing slashes if longer than 2 chars
      if (path.length > 2 && path.endsWith('/')) {
        path = path.slice(0, -1);
      }

      this.currentRoute = path;
      const appRoot = document.getElementById('app-root');
      const navbarRoot = document.getElementById('app-navbar');
      const footerRoot = document.getElementById('app-footer');

      if (!appRoot) return;

      // Ensure Store and AppState have processed any expired holds
      Store.expireHolds();
      await AppState.refreshAdmissionState();

      // Check if Authority Route
      const isAuthority = path.startsWith('#/authority');

      if (isAuthority) {
        // Requirement 1: Authority Verification Check
        const isAuthenticated = Store.isAdminAuthenticated();

        if (!isAuthenticated) {
          // Unverified: Display password verification step
          if (navbarRoot) {
            navbarRoot.innerHTML = `
              <header class="authority-header">
                <div class="container authority-header-container">
                  <div class="authority-brand">
                    <span class="authority-badge">Restricted Access</span>
                    <span class="authority-school">Hashmat Uddin High School</span>
                  </div>
                  <div class="authority-actions">
                    <a href="#/" class="btn btn-outline-light btn-sm">
                      ${Utils.icons.arrowLeft} Public Website
                    </a>
                  </div>
                </div>
              </header>
            `;
          }
          if (footerRoot) {
            footerRoot.innerHTML = '';
            footerRoot.style.display = 'none';
          }
          document.title = 'Authority Verification | Hashmat Uddin High School';
          await Pages.renderAuthorityVerificationPage(appRoot, () => {
            this.handleRouting();
          });
          return;
        }

        // Verified Authority User: Render authority header & subroutes
        if (navbarRoot) {
          navbarRoot.innerHTML = Components.renderAuthorityHeader(path);
          Components.bindAuthorityHeaderEvents();
        }
        if (footerRoot) {
          footerRoot.innerHTML = '';
          footerRoot.style.display = 'none';
        }

        // Route Authority Subpages
        if (path === '#/authority/admission-management' || path === '#/authority/dashboard' || path === '#/authority') {
          // Admin Landing Page Hub
          document.title = 'Authority Dashboard Hub | Hashmat Uddin High School';
          await Pages.renderAuthorityLandingPage(appRoot);
        } else if (path === '#/authority/create-class') {
          // Dedicated Create Class Page
          document.title = 'Create Admission Class — Authority Portal | Hashmat Uddin High School';
          await Pages.renderAuthorityCreateClassPage(appRoot);
        } else if (path === '#/authority/statistics') {
          // Dedicated Admission Statistics Page
          document.title = 'Admission Statistics — Authority Portal | Hashmat Uddin High School';
          await Pages.renderAuthorityStatisticsPage(appRoot);
        } else if (path === '#/authority/classes') {
          // Legacy route redirects to Statistics page
          window.location.hash = '#/authority/statistics';
          return;
        } else if (path.startsWith('#/authority/classes/')) {
          // Class Details & Student Rosters
          const classId = path.replace('#/authority/classes/', '').trim();
          this.currentParams = { classId };
          document.title = 'Class Roster Details — Authority Portal | Hashmat Uddin High School';
          await Pages.renderAuthorityClassDetailsPage(appRoot, classId);
        } else {
          window.location.hash = '#/authority/admission-management';
          return;
        }

      } else {
        // Public Student Website Layout
        if (navbarRoot) {
          navbarRoot.innerHTML = Components.renderNavbar(path);
          Components.bindNavbarEvents();
        }
        if (footerRoot) {
          footerRoot.style.display = 'block';
          footerRoot.innerHTML = Components.renderFooter();
        }

        // Match Public Routes
        if (path === '#/' || path === '') {
          document.title = 'Hashmat Uddin High School | Admission Portal';
          await Pages.renderHomePage(appRoot);
        } else if (path === '#/admission-info') {
          document.title = 'Admission Information | Hashmat Uddin High School';
          await Pages.renderAdmissionInfoPage(appRoot);
        } else if (path === '#/admissions/classes') {
          document.title = 'Explore Admission Classes | Hashmat Uddin High School';
          await Pages.renderClassSelectionPage(appRoot);
        } else if (path.startsWith('#/admissions/classes/')) {
          const classId = path.replace('#/admissions/classes/', '').trim();
          this.currentParams = { classId };
          document.title = 'Class Details & Seat Reservation | Hashmat Uddin High School';
          await Pages.renderPublicClassDetailsPage(appRoot, classId);
        } else if (path === '#/my-applications') {
          document.title = 'My Applications | Hashmat Uddin High School';
          await Pages.renderMyApplicationsPage(appRoot);
        } else if (path.startsWith('#/applications/')) {
          const holdId = path.replace('#/applications/', '').trim();
          this.currentParams = { holdId };
          document.title = `Application ${holdId} | Hashmat Uddin High School`;
          await Pages.renderApplicationDetailsPage(appRoot, holdId);
        } else {
          // Unknown route -> redirect to home
          window.location.hash = '#/';
          return;
        }
      }

      // Scroll to top on navigation
      window.scrollTo({ top: 0, behavior: 'instant' });
    },

    /**
     * Refresh current view without changing hash
     */
    async refreshCurrentPage() {
      await this.handleRouting();
    }
  };

  window.Router = Router;
})(window);
