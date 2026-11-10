/**
 * AuthorityNavbar.jsx - Authority Portal Header and Administrative Actions
 * Hashmat Uddin High School Online Admission System
 */

import { NavLink, Link, useLocation } from 'react-router';
import { useAdminAuth } from '../../context/useAdminAuth';
import { useToast } from '../../context/useToast';
import { schoolConfig } from '../../config/schoolConfig';
import { LogoIcon } from '../common/Icons';

export function AuthorityNavbar() {
  const { logout } = useAdminAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const isDashboard =
    location.pathname === '/authority/admission-management' ||
    location.pathname === '/authority/dashboard' ||
    location.pathname === '/authority';
  const isCreateClass = location.pathname === '/authority/create-class';
  const isStats =
    location.pathname === '/authority/statistics' ||
    location.pathname.startsWith('/authority/classes');

  const handleSignOut = async () => {
    await logout();
    showToast('Signed out of administration.', 'info');
  };

  return (
    <header className="authority-header">
      <div className="container authority-header-container">
        {/* Left: Logo & Location (matching student portal) */}
        <Link
          to="/authority/admission-management"
          className="brand-link"
          aria-label="Hashmat Uddin High School Authority Portal"
        >
          <span className="brand-crest">
            <LogoIcon />
          </span>
          <div className="brand-text">
            <span className="brand-name">{schoolConfig.name}</span>
            <span className="brand-location">{schoolConfig.location}</span>
          </div>
        </Link>

        {/* Middle: Page Navigations */}
        <nav className="authority-nav authority-nav-center" aria-label="Authority Navigation">
          <NavLink
            to="/authority/admission-management"
            className={`auth-nav-link ${isDashboard ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/authority/create-class"
            className={`auth-nav-link ${isCreateClass ? 'active' : ''}`}
          >
            New Class
          </NavLink>
          <NavLink
            to="/authority/statistics"
            className={`auth-nav-link ${isStats ? 'active' : ''}`}
          >
            Statistics
          </NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="authority-actions">
          <button
            type="button"
            className="btn btn-outline-light btn-sm"
            id="btn-admin-logout"
            title="Sign out of administration"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
          <Link to="/" className="btn btn-outline-light btn-sm">
            Student Portal
          </Link>
        </div>
      </div>
    </header>
  );
}

export default AuthorityNavbar;
