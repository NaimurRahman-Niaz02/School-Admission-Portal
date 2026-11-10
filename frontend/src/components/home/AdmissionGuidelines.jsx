/**
 * AdmissionGuidelines.jsx - Institutional Guidelines & Policies Checklist
 * Hashmat Uddin High School Online Admission System
 */

import { BookIcon, CheckIcon } from '../common/Icons';

export function AdmissionGuidelines() {
  return (
    <section className="section-guidelines" id="guidelines">
      <div className="container">
        <div className="guidelines-card">
          <div className="guidelines-header">
            <div className="guidelines-icon">
              <BookIcon />
            </div>
            <div>
              <h3 className="guidelines-title">Important Admission Guidelines</h3>
            </div>
          </div>

          <ul className="guidelines-list">
            <li className="guideline-item">
              <span className="guideline-check">
                <CheckIcon />
              </span>
              <div>
                <strong>Independent Options:</strong> Each class and shift (Morning or Day) is treated as a distinct admission option with its own seat quota.
              </div>
            </li>

            <li className="guideline-item">
              <span className="guideline-check">
                <CheckIcon />
              </span>
              <div>
                <strong>Single Active Application Policy:</strong> A student can hold at most <strong>one active reservation</strong> or <strong>one confirmed admission</strong> across the entire school.
              </div>
            </li>

            <li className="guideline-item">
              <span className="guideline-check">
                <CheckIcon />
              </span>
              <div>
                <strong>Changing Reservations:</strong> If you currently have an active reservation and wish to select another class or shift, you must first cancel the existing reservation.
              </div>
            </li>

            <li className="guideline-item">
              <span className="guideline-check">
                <CheckIcon />
              </span>
              <div>
                <strong>Finalized Admission:</strong> Once an admission fee is confirmed, the student cannot apply to any other class or shift.
              </div>
            </li>

            <li className="guideline-item">
              <span className="guideline-check">
                <CheckIcon />
              </span>
              <div>
                <strong>Automated Release:</strong> Unconfirmed seat holds expire precisely at the end of the 10-minute countdown and become instantly available to other students.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AdmissionGuidelines;
