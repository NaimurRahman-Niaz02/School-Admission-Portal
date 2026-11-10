/**
 * AppRouter.jsx - React Router Definition for all 11 Documented Pages
 * Hashmat Uddin High School Online Admission System
 */

import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthorityLayout } from '../layouts/AuthorityLayout';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { AdmissionInfoPage } from '../pages/public/AdmissionInfoPage';
import { ClassSelectionPage } from '../pages/public/ClassSelectionPage';
import { PublicClassDetailsPage } from '../pages/public/PublicClassDetailsPage';
import { MyApplicationsPage } from '../pages/public/MyApplicationsPage';
import { ApplicationDetailsPage } from '../pages/public/ApplicationDetailsPage';

// Authority Pages
import { AuthorityDashboardPage } from '../pages/authority/AuthorityDashboardPage';
import { AuthorityCreateClassPage } from '../pages/authority/AuthorityCreateClassPage';
import { AuthorityStatisticsPage } from '../pages/authority/AuthorityStatisticsPage';
import { AuthorityClassDetailsPage } from '../pages/authority/AuthorityClassDetailsPage';

export function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  // Support legacy or direct hash routes like #/admission-info -> /admission-info
  useEffect(() => {
    if (window.location.hash && window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.slice(1); // remove '#'
      navigate(cleanPath, { replace: true });
    }
  }, [navigate]);

  // Scroll to top on route change unless on hash anchor
  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.hash]);

  return (
    <Routes>
      {/* 1. PUBLIC STUDENT PORTAL ROUTES */}
      <Route element={<PublicLayout />}>
        {/* Page 1: Student Landing / Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Page 2: Admission Information Page */}
        <Route path="/admission-info" element={<AdmissionInfoPage />} />

        {/* Page 3: Class Selection & Matrix */}
        <Route path="/admissions/classes" element={<ClassSelectionPage />} />

        {/* Page 4: Public Class Details */}
        <Route path="/admissions/classes/:classId" element={<PublicClassDetailsPage />} />

        {/* Page 5: My Applications Hub */}
        <Route path="/my-applications" element={<MyApplicationsPage />} />

        {/* Page 6: Application Details & Admission Slip */}
        <Route path="/applications/:holdId" element={<ApplicationDetailsPage />} />
      </Route>

      {/* 2. PRIVATE AUTHORITY PORTAL ROUTES */}
      <Route path="/authority" element={<AuthorityLayout />}>
        {/* Default authority route redirects to admission management */}
        <Route index element={<Navigate to="/authority/admission-management" replace />} />

        {/* Page 8: Authority Dashboard Hub */}
        <Route path="admission-management" element={<AuthorityDashboardPage />} />
        <Route path="dashboard" element={<Navigate to="/authority/admission-management" replace />} />

        {/* Page 9: Create Admission Class */}
        <Route path="create-class" element={<AuthorityCreateClassPage />} />

        {/* Page 10: Admission Statistics & Analytics */}
        <Route path="statistics" element={<AuthorityStatisticsPage />} />

        {/* Redirect /authority/classes to /authority/statistics */}
        <Route path="classes" element={<Navigate to="/authority/statistics" replace />} />

        {/* Page 11: Authority Class Details & Student Rosters */}
        <Route path="classes/:classId" element={<AuthorityClassDetailsPage />} />
      </Route>

      {/* Catch-all unknown routes -> redirect to homepage */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;
