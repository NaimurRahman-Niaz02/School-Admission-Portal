/**
 * PublicNavbar.jsx - Reusable Header and Navigation Shell for Public Student Portal
 * Hashmat Uddin High School Online Admission System
 */

import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router';
import { useStudent } from '../../context/useStudent';
import { schoolConfig } from '../../config/schoolConfig';
import { maskStudentId } from '../../utils/formatters';
import { LogoIcon, MenuIcon, UserIcon, EditIcon } from '../common/Icons';

export function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { studentId, openIdentityModal } = useStudent();
  const location = useLocation();

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isClassesActive = location.pathname.startsWith('/admissions/classes');
  const isInfoActive = location.pathname.startsWith('/admission-info');
  const isMyAppsActive = location.pathname.startsWith('/my-applications');
  const isHomeActive = location.pathname === '/' || location.pathname === '';

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Brand */}
        <Link to="/" className="brand-link" aria-label="Hashmat Uddin High School Home" onClick={closeMobileMenu}>
          <span className="brand-crest">
            <LogoIcon />
          </span>
          <div className="brand-text">
            <span className="brand-name">{schoolConfig.name}</span>
            <span className="brand-location">{schoolConfig.location}</span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-nav-toggle"
          id="mobile-nav-toggle"
          aria-label="Toggle navigation menu"
          onClick={toggleMobileMenu}
        >
          <MenuIcon />
        </button>

        {/* Navigation Links */}
        <nav
          className={`site-nav ${mobileMenuOpen ? 'nav-open' : ''}`}
          id="site-nav"
          aria-label="Main Navigation"
        >
          <ul className="nav-list">
            <li className="nav-item">
              <NavLink
                to="/"
                end
                className={`nav-link ${isHomeActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admissions/classes"
                className={`nav-link ${isClassesActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Admission
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/admission-info"
                className={`nav-link ${isInfoActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Info
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/my-applications"
                className={`nav-link ${isMyAppsActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                My Applications
              </NavLink>
            </li>
          </ul>

          {/* Student Area */}
          <div className="nav-student-area">
            {studentId ? (
              <div className="student-identity-pill" title={`Active Student: ${studentId}`}>
                <span className="student-pill-icon">
                  <UserIcon />
                </span>
                <span className="student-pill-id font-mono">
                  {maskStudentId(studentId)}
                </span>
                <button
                  type="button"
                  className="btn-change-id-btn"
                  id="nav-btn-change-id"
                  title="Change Student ID"
                  onClick={() => {
                    closeMobileMenu();
                    openIdentityModal();
                  }}
                >
                  <EditIcon /> <span>Change</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-set-id"
                id="nav-btn-set-id"
                onClick={() => {
                  closeMobileMenu();
                  openIdentityModal();
                }}
              >
                <span className="btn-set-icon">
                  <UserIcon />
                </span>
                <span>Set Student ID</span>
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default PublicNavbar;
