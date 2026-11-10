/**
 * AdmissionJourney.jsx - 4-Step Visual Admission Journey
 * Hashmat Uddin High School Online Admission System
 */

import { SearchIcon, UserIcon, ClockIcon, CheckCircleIcon } from '../common/Icons';

export function AdmissionJourney() {
  return (
    <section className="section-steps" id="how-it-works">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">How Admission Works</h2>
        </div>

        <div className="steps-grid">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-badge">1</div>
            <div className="step-icon">
              <SearchIcon />
            </div>
            <h3 className="step-title">Explore Classes</h3>
            <p className="step-desc">
              Browse available grades and shifts to check real-time seat availability and quota status.
            </p>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-badge">2</div>
            <div className="step-icon">
              <UserIcon />
            </div>
            <h3 className="step-title">Select &amp; Reserve</h3>
            <p className="step-desc">
              Provide your 17-digit birth registration number and reserve one seat in your preferred class.
            </p>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-badge">3</div>
            <div className="step-icon">
              <ClockIcon />
            </div>
            <h3 className="step-title">Confirm Fee in 10 Min</h3>
            <p className="step-desc">
              Complete simulated admission payment before the 10-minute hold timer expires.
            </p>
          </div>

          {/* Step 4 */}
          <div className="step-card">
            <div className="step-badge">4</div>
            <div className="step-icon">
              <CheckCircleIcon />
            </div>
            <h3 className="step-title">Receive Confirmation</h3>
            <p className="step-desc">
              Get your official admission confirmation code and downloadable admission confirmation slip.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdmissionJourney;
