/**
 * PublicFooter.jsx - Public Footer Shell with Institutional Details
 * Strictly zero admin links or hints.
 * Hashmat Uddin High School Online Admission System
 */

import { Link, useNavigate } from 'react-router';
import { schoolConfig } from '../../config/schoolConfig';
import { admissionConfig } from '../../config/admissionConfig';
import { LogoIcon } from '../common/Icons';

export function PublicFooter() {
  const navigate = useNavigate();

  const handleScrollToSection = (sectionId) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        <div className="footer-grid">
          {/* Col 1: About */}
          <div className="footer-col footer-col-brand">
            <div className="footer-brand">
              <span className="footer-crest">
                <LogoIcon />
              </span>
              <span className="footer-school-name">{schoolConfig.name}</span>
            </div>
            <p className="footer-desc">{schoolConfig.tagline}</p>
            <div className="footer-badge">
              <span>{admissionConfig.sessionFullName}</span>
            </div>
          </div>

          {/* Col 2: Useful Public Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Admission Navigation</h4>
            <ul className="footer-links">
              <li>
                <Link to="/">Portal Home</Link>
              </li>
              <li>
                <Link to="/admissions/classes">Available Classes</Link>
              </li>
              <li>
                <Link to="/admission-info">Admission Information</Link>
              </li>
              <li>
                <Link to="/my-applications">Track My Applications</Link>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('how-it-works');
                  }}
                >
                  Admission Process
                </a>
              </li>
              <li>
                <a
                  href="#guidelines"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection('guidelines');
                  }}
                >
                  Admission Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Campus Info */}
          <div className="footer-col">
            <h4 className="footer-heading">Campus Admission Office</h4>
            <address className="footer-address">
              <p>{schoolConfig.campusOffice.institution}</p>
              <p>{schoolConfig.campusOffice.addressLine1}</p>
              <p>Email: {schoolConfig.contact.email}</p>
              <p>Phone: {schoolConfig.contact.helpline1} / {schoolConfig.contact.helpline2}</p>
              <p>Hours: {schoolConfig.contact.officeDays}, {schoolConfig.contact.officeHours}</p>
            </address>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {schoolConfig.copyrightYear} {schoolConfig.name}. All rights reserved.
          </p>
          <p className="footer-tech-note text-muted">
            {schoolConfig.allocationPolicy}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default PublicFooter;

