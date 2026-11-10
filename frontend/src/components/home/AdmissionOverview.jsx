/**
 * AdmissionOverview.jsx - Four Core Highlights of the Transparent Admission System
 * Hashmat Uddin High School Online Admission System
 */

import { CheckCircleIcon, ClockIcon, AlertTriangleIcon, CreditCardIcon } from '../common/Icons';

export function AdmissionOverview() {
  return (
    <section className="section-overview" id="overview">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Transparent &amp; Fair Admission System</h2>
        </div>

        <div className="overview-grid">
          <div className="overview-card">
            <div className="overview-icon icon-teal">
              <CheckCircleIcon />
            </div>
            <h3 className="overview-title">First-Come, First-Served</h3>
            <p className="overview-desc">
              Seat quotas are allocated strictly on a chronological first-come basis. Live availability is visible to all candidates simultaneously.
            </p>
          </div>

          <div className="overview-card">
            <div className="overview-icon icon-blue">
              <ClockIcon />
            </div>
            <h3 className="overview-title">10-Minute Seat Reservation</h3>
            <p className="overview-desc">
              When you select an available class, a seat is held exclusively for you for 10 minutes to review and finalize your admission.
            </p>
          </div>

          <div className="overview-card">
            <div className="overview-icon icon-amber">
              <AlertTriangleIcon />
            </div>
            <h3 className="overview-title">Automatic Expiration</h3>
            <p className="overview-desc">
              If the admission fee is not confirmed within the 10-minute reservation window, the held seat automatically returns to the open pool.
            </p>
          </div>

          <div className="overview-card">
            <div className="overview-icon icon-emerald">
              <CreditCardIcon />
            </div>
            <h3 className="overview-title">Simulated Fee Confirmation</h3>
            <p className="overview-desc">
              In this admission portal prototype, confirm your application through our simulated payment gateway with immediate confirmation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdmissionOverview;
