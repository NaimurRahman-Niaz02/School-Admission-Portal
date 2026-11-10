/**
 * AcademicClassesBanner.jsx - Stylized Middle Line Banner and Class Quick Explorer
 * Hashmat Uddin High School Online Admission System
 */

import { Link } from 'react-router';
import { BookIcon, ClockIcon, CheckCircleIcon, ArrowRightIcon } from '../common/Icons';

export function AcademicClassesBanner() {
  return (
    <section className="section-featured-minimal" id="academic-classes">
      <div className="container text-center">
        <h2 className="section-title">Academic Classes</h2>

        {/* Stylized Middle Line Banner */}
        <div className="academic-classes-banner">
          <div className="academic-chip chip-classes">
            <span className="chip-icon">
              <BookIcon />
            </span>
            <span className="chip-text">
              <strong>Class 6</strong> through <strong>10</strong>
            </span>
          </div>

          <span className="chip-separator"></span>

          <div className="academic-chip chip-shifts">
            <span className="chip-icon">
              <ClockIcon />
            </span>
            <span className="chip-text">
              <strong>Morning</strong> &amp; <strong>Day</strong> Shifts
            </span>
          </div>

          <span className="chip-separator"></span>

          <div className="academic-chip chip-disciplines">
            <span className="chip-icon">
              <CheckCircleIcon />
            </span>
            <span className="chip-text">
              <strong>Science</strong> &bull; <strong>Arts</strong> &bull; <strong>Commerce</strong>
            </span>
          </div>
        </div>

        <div className="minimal-actions">
          <Link to="/admissions/classes" className="btn btn-primary btn-lg btn-explore-classes">
            Explore Admission Classes <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AcademicClassesBanner;
