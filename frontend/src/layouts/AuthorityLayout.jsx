/**
 * AuthorityLayout.jsx - Isolated Layout for Authority Portal
 * Gated by Passcode Verification Layer
 * Hashmat Uddin High School Online Admission System
 */

import { Outlet } from 'react-router';
import { useAdminAuth } from '../context/useAdminAuth';
import { AuthorityNavbar } from '../components/layout/AuthorityNavbar';
import { AuthorityVerificationGate } from '../pages/authority/AuthorityVerificationGate';

export function AuthorityLayout() {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="container text-center p-8">
        <span className="spinner-sm"></span> Loading authority portal...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthorityVerificationGate />;
  }

  return (
    <>
      <AuthorityNavbar />
      <main id="app-root" role="main">
        <Outlet />
      </main>
    </>
  );
}

export default AuthorityLayout;
