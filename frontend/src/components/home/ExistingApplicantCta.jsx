/**
 * ExistingApplicantCta.jsx - CTA Card Directing Candidates to Track Applications
 * Hashmat Uddin High School Online Admission System
 */

import { Link } from 'react-router';
import { ArrowRightIcon } from '../common/Icons';

export function ExistingApplicantCta() {
  return (
    <section className="section-applicant-cta">
      <div className="container">
        <div className="applicant-cta-box">
          <div className="cta-text">
            <h3 className="cta-title">Already Applied?</h3>
          </div>
          <div className="cta-action">
            <Link to="/my-applications" className="btn btn-primary btn-lg">
              View My Applications <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExistingApplicantCta;

