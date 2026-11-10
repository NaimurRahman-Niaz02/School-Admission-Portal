/**
 * ApplicationDetailsPage.jsx - Application Status, 10-Minute Hold, and Printable Admission Slip
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { useStudent } from '../../context/useStudent';
import { useToast } from '../../context/useToast';
import { apiService } from '../../services/apiService';
import { PaymentModal } from '../../components/modals/PaymentModal';
import { CancelReservationModal } from '../../components/modals/CancelReservationModal';
import {
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  CloseIcon,
  CreditCardIcon,
  DownloadIcon,
  LogoIcon,
  AlertTriangleIcon,
  QrCodeIcon,
} from '../../components/common/Icons';
import {
  formatDate,
  formatTimeRemaining,
  maskStudentId,
} from '../../utils/formatters';

export function ApplicationDetailsPage() {
  const { holdId } = useParams();
  const { studentId } = useStudent();
  const { showToast } = useToast();

  const [hold, setHold] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // 1-second clock ticker for live countdowns
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(clockTimer);
  }, []);

  // Initial data load
  useEffect(() => {
    let isMounted = true;

    const fetchHold = async () => {
      try {
        const data = await apiService.getHoldById(holdId);
        if (isMounted) {
          setHold(data);
          setNotFound(false);
          document.title = `Application ${data.applicationCode || holdId} | Hashmat Uddin High School`;
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          if (err.status === 404) {
            setNotFound(true);
          } else {
            console.error('Error loading hold details:', err);
          }
          setIsLoading(false);
        }
      }
    };

    fetchHold();

    return () => {
      isMounted = false;
    };
  }, [holdId]);

  // Derived countdown remaining seconds
  const remainingSeconds =
    hold && hold.status === 'HELD'
      ? Math.max(
          0,
          Math.floor((new Date(hold.expiresAt).getTime() - currentTime) / 1000)
        )
      : 0;

  // Handle countdown zero transition
  useEffect(() => {
    if (hold && hold.status === 'HELD' && remainingSeconds === 0) {
      // Re-fetch hold to transition automatically to EXPIRED
      apiService
        .getHoldById(holdId)
        .then((updated) => setHold(updated))
        .catch(console.error);
    }
  }, [hold, remainingSeconds, holdId]);

  // Handle Payment Confirmation
  const handlePaymentConfirm = async () => {
    try {
      const activeId = studentId || hold?.studentId;
      const confirmedHold = await apiService.confirmHold(hold.holdId, activeId);
      setHold(confirmedHold);
      showToast(
        'Admission successfully confirmed! Congratulations!',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Payment confirmation failed.', 'error');
      throw err;
    }
  };

  // Handle Cancellation Confirmation
  const handleCancelConfirm = async () => {
    try {
      const activeId = studentId || hold?.studentId;
      const cancelledHold = await apiService.cancelHold(hold.holdId, activeId);
      setHold(cancelledHold);
      showToast(
        'Seat reservation cancelled. The seat has been released.',
        'info'
      );
    } catch (err) {
      showToast(err.message || 'Failed to cancel reservation.', 'error');
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="app-details-page-wrapper">
        <div className="container">
          <div className="page-breadcrumbs pt-6 mb-4">
            <Link to="/">Home</Link> /{' '}
            <Link to="/my-applications">Applications</Link> /{' '}
            <span>Application Details</span>
          </div>
          <div className="app-details-container">
            <div
              className="skeleton-line"
              style={{ width: '100%', height: '280px' }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !hold) {
    return (
      <div className="app-details-page-wrapper">
        <div className="container">
          <div className="page-breadcrumbs pt-6 mb-4">
            <Link to="/">Home</Link> /{' '}
            <Link to="/my-applications">Applications</Link> /{' '}
            <span>Application Details</span>
          </div>
          <div className="app-details-container">
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <AlertTriangleIcon width={44} height={44} />
              </div>
              <h3 className="empty-state-title">Application Not Found</h3>
              <p className="empty-state-description">
                We could not locate an admission application with reference &quot;{holdId}&quot;.
              </p>
              <div className="empty-state-actions">
                <Link to="/my-applications" className="btn btn-primary">
                  Back to My Applications
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isUrgent = remainingSeconds <= 60;
  const classFee = hold.classInfo?.fee || hold.fee || 1500;

  return (
    <div className="app-details-page-wrapper">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="page-breadcrumbs pt-6 mb-4">
          <Link to="/">Home</Link> /{' '}
          <Link to="/my-applications">Applications</Link> /{' '}
          <span>Application Details</span>
        </div>

        <div className="app-reference-row mb-6">
          <span className="font-mono text-xs text-muted" id="app-id-subtitle">
            Hold Reference: {hold.holdId}
          </span>
        </div>

        <div id="details-content-area" className="app-details-container">
          {/* =============================================================
              STATE A: HELD (10-minute hold active)
             ============================================================= */}
          {hold.status === 'HELD' && (
            <div className="details-card details-card-held">
              <div className="details-status-bar status-bar-held">
                <div className="status-left">
                  <span className="badge badge-held">
                    <ClockIcon width={16} height={16} /> SEAT RESERVED (HELD)
                  </span>
                  <span className="status-tip">Temporary Seat Reservation</span>
                </div>
                <div className="status-right font-mono text-sm text-muted">
                  Created: {formatDate(hold.createdAt)}
                </div>
              </div>

              {/* Countdown Hero Block */}
              <div className="countdown-hero-block">
                <span className="countdown-title">RESERVATION EXPIRES IN</span>
                <div
                  className={`countdown-timer-large font-mono ${
                    isUrgent ? 'timer-urgent' : ''
                  }`}
                  id="details-countdown"
                >
                  {formatTimeRemaining(remainingSeconds)}
                </div>

                {/* Class Specifications Badges */}
                <div className="held-class-specs-badges">
                  <div className="held-spec-pill">
                    <span className="spec-label">Class</span>
                    <span className="spec-value font-bold">
                      {hold.grade || hold.classInfo?.grade || 'Class'}
                    </span>
                  </div>
                  <div className="held-spec-pill">
                    <span className="spec-label">Shift</span>
                    <span className="spec-value font-bold">
                      {hold.shift || hold.classInfo?.shift || 'Morning'}
                    </span>
                  </div>
                  {(hold.group && hold.group !== 'General') ||
                  (hold.classInfo?.group &&
                    hold.classInfo?.group !== 'General') ? (
                    <div className="held-spec-pill highlight-group">
                      <span className="spec-label">Group</span>
                      <span className="spec-value font-bold text-teal">
                        {hold.group || hold.classInfo?.group}
                      </span>
                    </div>
                  ) : null}
                  <div className="held-spec-pill highlight-fee">
                    <span className="spec-label">Admission Fee</span>
                    <span className="spec-value font-bold text-emerald font-mono">
                      ৳{classFee.toLocaleString()}
                    </span>
                  </div>
                  <div className="held-spec-pill">
                    <span className="spec-label">Session</span>
                    <span className="spec-value font-bold">
                      {hold.session || hold.classInfo?.session || 'Session 27'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Info Grid */}
              <div className="details-info-grid">
                <div className="info-cell">
                  <span className="info-label">Application Code</span>
                  <span className="info-val font-mono font-bold">
                    {hold.applicationCode || hold.holdId}
                  </span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Class &amp; Shift</span>
                  <span className="info-val font-semibold">{hold.className}</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Student ID</span>
                  <span className="info-val font-mono">
                    {maskStudentId(hold.studentId)}
                  </span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Reservation Expiry</span>
                  <span className="info-val">{formatDate(hold.expiresAt)}</span>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="details-actions-bar">
                <button
                  type="button"
                  className="btn btn-success btn-lg"
                  id="btn-pay-admission"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <CreditCardIcon width={18} height={18} /> Pay Admission Fee
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  id="btn-cancel-reservation"
                  onClick={() => setIsCancelModalOpen(true)}
                >
                  <CloseIcon width={18} height={18} /> Cancel Reservation
                </button>
              </div>
            </div>
          )}

          {/* =============================================================
              STATE B: CONFIRMED (Official Admission Slip)
             ============================================================= */}
          {hold.status === 'CONFIRMED' && (
            <div className="details-card details-card-confirmed">
              <div className="confirmed-hero-banner">
                <div className="confirmed-icon-circle">
                  <CheckCircleIcon width={36} height={36} />
                </div>
                <h2 className="confirmed-title">Admission Confirmed</h2>
                <p className="confirmed-subtitle">
                  Congratulations! You are officially enrolled at Hashmat Uddin High School for Session 27 (2026–2027).
                </p>
              </div>

              {/* Official Printable Admission Certificate / Slip */}
              <div className="admission-slip-box" id="admission-slip">
                <div className="slip-header">
                  <div className="slip-brand">
                    <span className="slip-crest">
                      <LogoIcon width={28} height={28} />
                    </span>
                    <div>
                      <h3 className="slip-school-name">Hashmat Uddin High School</h3>
                      <p className="slip-office">
                        Office of Admissions &bull; Official Enrollment Slip
                      </p>
                      <p className="text-xs text-muted">
                        Nagua, Sadar, Kishoreganj - 2300, Dhaka Division
                      </p>
                    </div>
                  </div>
                  <div className="slip-status-badge">
                    <span className="badge badge-confirmed">CONFIRMED</span>
                  </div>
                </div>

                <div className="slip-body-grid">
                  <div className="slip-row">
                    <span className="slip-label">Application Serial Code:</span>
                    <span className="slip-value font-mono font-bold">
                      {hold.applicationCode || hold.holdId}
                    </span>
                  </div>
                  <div className="slip-row">
                    <span className="slip-label">Candidate Birth Registration ID:</span>
                    <span className="slip-value font-mono font-bold">
                      {hold.studentId}
                    </span>
                  </div>
                  <div className="slip-row">
                    <span className="slip-label">Enrolled Class:</span>
                    <span className="slip-value font-semibold text-primary">
                      {hold.className}
                    </span>
                  </div>
                  <div className="slip-row">
                    <span className="slip-label">Academic Session:</span>
                    <span className="slip-value font-semibold">
                      {hold.session || hold.classInfo?.session || 'Session 27 (2026–2027)'}
                    </span>
                  </div>
                  <div className="slip-row">
                    <span className="slip-label">Shift &amp; Group:</span>
                    <span className="slip-value">
                      {hold.shift || hold.classInfo?.shift || 'Morning'} Shift &bull;{' '}
                      {hold.group || hold.classInfo?.group || 'General'} Group
                    </span>
                  </div>
                  <div className="slip-row">
                    <span className="slip-label">Confirmation Timestamp:</span>
                    <span className="slip-value">
                      {formatDate(hold.confirmedAt || hold.createdAt)}
                    </span>
                  </div>
                  <div className="slip-row">
                    <span className="slip-label">Admission Fee Paid:</span>
                    <span className="slip-value text-emerald font-semibold">
                      ৳{classFee.toLocaleString()} (Verified)
                    </span>
                  </div>
                  <div className="slip-row">
                    <span className="slip-label">Seat Status:</span>
                    <span className="slip-value font-semibold">
                      Guaranteed &bull; Quota Locked
                    </span>
                  </div>
                </div>

                {/* QR Placeholder & Headmaster Seal / Signature Block */}
                <div
                  className="slip-verification-row mt-6 pt-4"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: '20px',
                    borderTop: '1px dashed #cbd5e1',
                  }}
                >
                  <div
                    className="slip-qr-block"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <div
                      className="slip-qr-box"
                      style={{
                        width: '64px',
                        height: '64px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <QrCodeIcon width={34} height={34} className="text-muted" />
                      <span
                        style={{
                          fontSize: '8px',
                          fontWeight: 'bold',
                          color: '#64748b',
                        }}
                      >
                        VERIFY
                      </span>
                    </div>
                    <div style={{ maxWidth: '210px' }}>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#334155',
                        }}
                      >
                        Verification QR Code
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: '#64748b',
                          lineHeight: '1.25',
                        }}
                      >
                        Reference placeholder for physical on-campus verification
                      </div>
                    </div>
                  </div>

                  <div
                    className="slip-seal-block"
                    style={{ textAlign: 'center', minWidth: '160px' }}
                  >
                    <div
                      className="seal-stamp-box"
                      style={{
                        border: '2px solid #0f2b48',
                        borderRadius: '50%',
                        width: '68px',
                        height: '68px',
                        margin: '0 auto 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0f2b48',
                        fontSize: '9px',
                        fontWeight: '800',
                        lineHeight: '1.1',
                        textTransform: 'uppercase',
                      }}
                    >
                      <span>HUHS</span>
                      <span style={{ fontSize: '7px' }}>SEAL</span>
                      <span>2026</span>
                    </div>
                    <div
                      style={{
                        borderTop: '1px solid #334155',
                        paddingTop: '4px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#0f2b48',
                      }}
                    >
                      Headmaster
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      Hashmat Uddin High School
                    </div>
                  </div>
                </div>

                <div className="slip-footer">
                  <p className="text-xs text-muted">
                    This document serves as proof of online seat allocation. Please retain this slip reference for school orientation and document verification.
                  </p>
                </div>
              </div>

              <div className="details-actions-bar text-center mt-6">
                <button
                  type="button"
                  className="btn btn-outline"
                  id="btn-print-slip"
                  onClick={() => window.print()}
                >
                  <DownloadIcon width={18} height={18} /> Print / Save Slip
                </button>
                <Link to="/my-applications" className="btn btn-primary">
                  View My Applications
                </Link>
              </div>
            </div>
          )}

          {/* =============================================================
              STATE C: EXPIRED
             ============================================================= */}
          {hold.status === 'EXPIRED' && (
            <div className="details-card details-card-expired">
              <div className="resolution-hero-banner banner-expired">
                <div className="resolution-icon-circle icon-expired">
                  <AlertCircleIcon width={36} height={36} />
                </div>
                <h2 className="resolution-title">Reservation Expired</h2>
                <p className="resolution-subtitle">
                  The 10-minute hold window for this seat expired without fee confirmation. The seat has been released and returned to the school&apos;s available quota.
                </p>
              </div>

              <div className="details-info-grid mt-4">
                <div className="info-cell">
                  <span className="info-label">Application Code</span>
                  <span className="info-val font-mono">
                    {hold.applicationCode || hold.holdId}
                  </span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Class</span>
                  <span className="info-val">{hold.className}</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Candidate ID</span>
                  <span className="info-val font-mono">
                    {maskStudentId(hold.studentId)}
                  </span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Expired At</span>
                  <span className="info-val">
                    {formatDate(hold.expiredAt || hold.expiresAt)}
                  </span>
                </div>
              </div>

              <div className="details-actions-bar mt-4">
                <Link
                  to="/admissions/classes"
                  className="btn btn-primary btn-lg"
                >
                  Browse Available Classes
                </Link>
                <Link to="/my-applications" className="btn btn-secondary">
                  View All Applications
                </Link>
              </div>
            </div>
          )}

          {/* =============================================================
              STATE D: CANCELLED
             ============================================================= */}
          {hold.status === 'CANCELLED' && (
            <div className="details-card details-card-cancelled">
              <div className="resolution-hero-banner banner-cancelled">
                <div className="resolution-icon-circle icon-cancelled">
                  <CloseIcon width={36} height={36} />
                </div>
                <h2 className="resolution-title">Reservation Cancelled</h2>
                <p className="resolution-subtitle">
                  You cancelled this seat reservation. The reserved seat in{' '}
                  <strong>{hold.className}</strong> was immediately returned to the school&apos;s open quota.
                </p>
              </div>

              <div className="details-info-grid mt-4">
                <div className="info-cell">
                  <span className="info-label">Application Code</span>
                  <span className="info-val font-mono">
                    {hold.applicationCode || hold.holdId}
                  </span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Class</span>
                  <span className="info-val">{hold.className}</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Candidate ID</span>
                  <span className="info-val font-mono">
                    {maskStudentId(hold.studentId)}
                  </span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Cancelled At</span>
                  <span className="info-val">
                    {formatDate(hold.cancelledAt || new Date().toISOString())}
                  </span>
                </div>
              </div>

              <div className="details-actions-bar mt-4">
                <Link
                  to="/admissions/classes"
                  className="btn btn-primary btn-lg"
                >
                  Choose Another Class
                </Link>
                <Link to="/my-applications" className="btn btn-secondary">
                  View All Applications
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        hold={hold}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handlePaymentConfirm}
      />

      {/* Cancel Reservation Modal */}
      <CancelReservationModal
        isOpen={isCancelModalOpen}
        hold={hold}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}

export default ApplicationDetailsPage;
