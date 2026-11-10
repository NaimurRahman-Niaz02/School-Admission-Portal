/**
 * AdmissionInfoPage.jsx - Comprehensive Admission Guidelines, Shift Schedules, and Fee Matrix
 * Hashmat Uddin High School Online Admission System
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { storageService } from '../../services/storageService';
import { schoolConfig } from '../../config/schoolConfig';
import { admissionConfig } from '../../config/admissionConfig';
import {
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  LogoIcon,
  PhoneIcon,
} from '../../components/common/Icons';

export function AdmissionInfoPage() {
  const [timelineDisplay] = useState(() => {
    const timeline = storageService.getTimeline();
    if (timeline && timeline.startDate && timeline.endDate) {
      return admissionConfig.formatTimelineRange(timeline.startDate, timeline.endDate);
    }
    return 'To be announced';
  });

  useEffect(() => {
    document.title = 'Admission Information | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="info-page-wrapper">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="page-breadcrumbs pt-6 mb-6">
          <Link to="/">Home</Link> / <span>Info</span>
        </div>

        {/* Session Schedule Highlight Banner */}
        <div className="admission-info-banner mb-10">
          <div className="banner-icon">
            <ClockIcon width={24} height={24} />
          </div>
          <div className="banner-content">
            <h3 className="banner-title">{admissionConfig.sessionFullName}</h3>
            <p className="banner-desc">
              Online admission is conducted strictly on a <strong>chronological first-come, first-served</strong> basis. Seat reservations are secured immediately upon selecting an available class and holding for 10 minutes.
            </p>
          </div>
          <div className="banner-action">
            <div className="banner-dates">
              <span className="text-xs text-muted">Admission Timeline</span>
              <span className="font-bold text-primary">{timelineDisplay}</span>
            </div>
          </div>
        </div>

        {/* School Shift Times Section */}
        <div className="info-section mb-10">
          <h2 className="section-title text-center">School Shift Times</h2>
          <div className="shift-times-grid">
            {admissionConfig.shifts.map((shift) => (
              <div key={shift.id} className={`shift-time-card ${shift.cardClass}`}>
                <div className="shift-card-header">
                  <div className={`shift-icon-box ${shift.iconClass}`}>
                    <ClockIcon width={20} height={20} />
                  </div>
                  <div>
                    <span className={`shift-badge ${shift.badgeClass}`}>{shift.badge}</span>
                    <h3 className="shift-name">{shift.name}</h3>
                  </div>
                </div>
                <div className="shift-card-time font-mono">{shift.timeRange}</div>
                <div className="shift-card-info">
                  <span className="shift-info-item">
                    <strong>Applicable:</strong> {shift.applicableGrades}
                  </span>
                  <span className="shift-info-item">
                    <strong>Assembly:</strong> {shift.assemblyTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Fee Structure */}
        <div className="info-section">
          <h2 className="section-title text-center">Official Fee Structure</h2>
          <div className="table-responsive info-fee-table-card">
            <table className="authority-table fee-structure-table">
              <thead>
                <tr>
                  <th className="text-center">Grade / Class</th>
                  <th className="text-center">Curriculum / Group</th>
                  <th className="text-center">Admission Fee</th>
                </tr>
              </thead>
              <tbody>
                {admissionConfig.feeSchedule.map((row, idx) => (
                  <tr key={`${row.grade}-${row.group}-${idx}`}>
                    <td className="font-bold text-primary text-center">{row.grade}</td>
                    <td className="text-center">
                      <span className={row.groupClass || ''}>{row.group}</span>
                    </td>
                    <td className="font-bold text-emerald font-mono text-center">
                      ৳{row.fee.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Requirements */}
        <div className="info-section">
          <h2 className="section-title text-center">Candidate Requirements</h2>
          <div className="guidelines-card">
            <ul className="guidelines-list">
              <li className="guideline-item">
                <span className="guideline-check">
                  <CheckIcon />
                </span>
                <div>
                  <strong>17-Digit Birth Registration Number:</strong> Each applicant must provide an official, government-issued 17-digit birth registration number.
                </div>
              </li>
              <li className="guideline-item">
                <span className="guideline-check">
                  <CheckIcon />
                </span>
                <div>
                  <strong>Single Reservation Policy:</strong> Only one active reservation or one confirmed admission is allowed per student across {schoolConfig.name}.
                </div>
              </li>
              <li className="guideline-item">
                <span className="guideline-check">
                  <CheckIcon />
                </span>
                <div>
                  <strong>10-Minute Hold Window:</strong> A reserved seat is protected for precisely 10 minutes. Complete the simulated fee payment before timer expiration to confirm enrollment.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Explore Classes CTA Button */}
        <div className="text-center info-cta-wrapper">
          <Link to="/admissions/classes" className="btn btn-primary btn-lg btn-explore-classes">
            Explore Available Classes &amp; Reserve Seat <ArrowRightIcon />
          </Link>
        </div>

        {/* Admission Helpdesk & Contact Section (Offline, Phone, In-Person Help) */}
        <div className="info-section info-contact-section">
          <h2 className="section-title text-center">Admission Helpdesk &amp; Offline Support</h2>
          <p className="section-subtitle text-center mb-8">
            Need assistance with registration, prefer to apply offline, or have questions about eligibility? Our admission officers are ready to help.
          </p>

          <div className="contact-cards-grid">
            {/* Card 1: Physical Campus Helpdesk */}
            <div className="contact-info-card">
              <div className="contact-card-icon icon-physical">
                <LogoIcon />
              </div>
              <h3 className="contact-card-title">Campus Visit (Offline Help)</h3>
              <p className="contact-card-desc">
                Visit our admission office in person for hands-on guidance with registration, birth certificate verification, and fee procedures.
              </p>
              <div className="contact-details-list">
                <div className="contact-detail-row">
                  <span className="detail-label">Institution:</span>
                  <span className="detail-value font-semibold">{schoolConfig.campusOffice.institution}</span>
                </div>
                <div className="contact-detail-row">
                  <span className="detail-label">Location:</span>
                  <span className="detail-value">{schoolConfig.campusOffice.location}</span>
                </div>
                <div className="contact-detail-row">
                  <span className="detail-label">Help Desk:</span>
                  <span className="detail-value">{schoolConfig.campusOffice.room}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Phone Hotline */}
            <div className="contact-info-card">
              <div className="contact-card-icon icon-phone">
                <PhoneIcon />
              </div>
              <h3 className="contact-card-title">Phone &amp; Direct Hotline</h3>
              <p className="contact-card-desc">
                Call our admission support staff directly for inquiries on class availability, shifts, or submission status.
              </p>
              <div className="contact-details-list">
                <div className="contact-detail-row">
                  <span className="detail-label">Helpline 1:</span>
                  <a href={`tel:${schoolConfig.contact.helpline1}`} className="detail-value font-mono font-bold text-primary">
                    {schoolConfig.contact.helpline1}
                  </a>
                </div>
                <div className="contact-detail-row">
                  <span className="detail-label">Helpline 2:</span>
                  <a href={`tel:${schoolConfig.contact.helpline2}`} className="detail-value font-mono font-bold text-primary">
                    {schoolConfig.contact.helpline2}
                  </a>
                </div>
                <div className="contact-detail-row">
                  <span className="detail-label">WhatsApp:</span>
                  <span className="detail-value font-mono">{schoolConfig.contact.whatsapp}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Office Hours & Email */}
            <div className="contact-info-card">
              <div className="contact-card-icon icon-hours">
                <ClockIcon />
              </div>
              <h3 className="contact-card-title">Office Hours &amp; Inquiries</h3>
              <p className="contact-card-desc">
                Our on-campus desk operates during standard school hours. You can also contact us via email.
              </p>
              <div className="contact-details-list">
                <div className="contact-detail-row">
                  <span className="detail-label">Days:</span>
                  <span className="detail-value font-semibold">{schoolConfig.contact.officeDays}</span>
                </div>
                <div className="contact-detail-row">
                  <span className="detail-label">Hours:</span>
                  <span className="detail-value font-semibold">{schoolConfig.contact.officeHours}</span>
                </div>
                <div className="contact-detail-row">
                  <span className="detail-label">Email:</span>
                  <a href={`mailto:${schoolConfig.contact.email}`} className="detail-value text-primary">
                    {schoolConfig.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdmissionInfoPage;
