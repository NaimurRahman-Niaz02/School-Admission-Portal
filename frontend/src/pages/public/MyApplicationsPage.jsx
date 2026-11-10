/**
 * MyApplicationsPage.jsx - Student Applications and Admission Status Hub
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useStudent } from '../../context/useStudent';
import { apiService } from '../../services/apiService';
import {
  UserIcon,
  BookIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  CloseIcon,
} from '../../components/common/Icons';
import {
  formatDate,
  formatTimeRemaining,
  isValid17DigitId,
} from '../../utils/formatters';

export function MyApplicationsPage() {
  const { studentId, openIdentityModal } = useStudent();

  const [holds, setHolds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatusFilter, setCurrentStatusFilter] = useState('ALL');
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    document.title = 'My Applications | Hashmat Uddin High School';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // 1-second clock ticker to drive live countdown without impure Date.now() in render
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(clockTimer);
  }, []);

  // Initial and reactive load
  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      await Promise.resolve();
      if (!isMounted) return;

      if (!studentId || !isValid17DigitId(studentId)) {
        setHolds([]);
        setIsLoading(false);
        return;
      }

      try {
        const fetchedHolds = await apiService.getStudentHolds(studentId);
        if (isMounted) {
          setHolds(fetchedHolds);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching student applications:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [studentId]);

  // 5-second polling interval
  useEffect(() => {
    if (!studentId || !isValid17DigitId(studentId)) return;

    let isMounted = true;

    const pollApplications = async () => {
      try {
        const fetchedHolds = await apiService.getStudentHolds(studentId);
        if (isMounted) {
          setHolds(fetchedHolds);
        }
      } catch (err) {
        console.error('Polling student applications error:', err);
      }
    };

    const pollTimer = setInterval(pollApplications, 5000);
    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [studentId]);

  // Active Hold vs Confirmed vs History segregation (pure calculation using currentTime state)
  const confirmedHold = holds.find((h) => h.status === 'CONFIRMED');
  const activeHold = holds.find(
    (h) => h.status === 'HELD' && new Date(h.expiresAt).getTime() > currentTime
  );

  const currentAdmission = confirmedHold || activeHold || null;
  const historicalHolds = holds.filter((h) => h !== currentAdmission);

  // Filter historical holds by status tab
  const visibleHistory = historicalHolds.filter((h) => {
    if (currentStatusFilter === 'EXPIRED') return h.status === 'EXPIRED';
    if (currentStatusFilter === 'CANCELLED') return h.status === 'CANCELLED';
    return true;
  });

  // Purely derived remaining seconds
  const remainingSeconds = activeHold
    ? Math.max(
        0,
        Math.floor((new Date(activeHold.expiresAt).getTime() - currentTime) / 1000)
      )
    : 0;

  return (
    <div className="my-applications-page-wrapper">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="page-breadcrumbs pt-6 mb-4">
          <Link to="/">Home</Link> / <span>Applications</span>
        </div>

        {/* Centered Student Session Identity Card */}
        <div className="student-session-centered-wrapper mb-8">
          <div className="student-session-card" id="student-session-card">
            {studentId ? (
              <div className="active-student-badge">
                <span className="badge-avatar">
                  <UserIcon />
                </span>
                <div>
                  <div className="text-xs text-muted">Active Student ID</div>
                  <div className="font-mono font-bold">{studentId}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  id="btn-change-student-app"
                  onClick={openIdentityModal}
                >
                  Change ID
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                id="btn-enter-student-app"
                onClick={openIdentityModal}
              >
                <UserIcon /> Identify Student to View Applications
              </button>
            )}
          </div>
        </div>

        <div id="applications-content-area">
          {isLoading ? (
            <div className="skeleton-table">
              <div
                className="skeleton-line"
                style={{ width: '100%', height: '80px', marginBottom: '16px' }}
              ></div>
              <div
                className="skeleton-line"
                style={{ width: '100%', height: '80px', marginBottom: '16px' }}
              ></div>
            </div>
          ) : !studentId ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <UserIcon width={44} height={44} />
              </div>
              <h3 className="empty-state-title">No Student ID Configured</h3>
              <p className="empty-state-description">
                Enter your 17-digit birth registration number to view your seat reservations and admission history.
              </p>
              <div className="empty-state-actions">
                <button
                  type="button"
                  id="btn-empty-enter-id"
                  className="btn btn-primary"
                  onClick={openIdentityModal}
                >
                  Enter Student ID
                </button>
              </div>
            </div>
          ) : holds.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <BookIcon width={44} height={44} />
              </div>
              <h3 className="empty-state-title">No Applications Yet</h3>
              <p className="empty-state-description">
                You have not submitted any class admission reservations yet.
              </p>
              <div className="empty-state-actions">
                <Link to="/admissions/classes" className="btn btn-primary">
                  Explore Available Classes
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Active Admission Record Card */}
              {currentAdmission && (
                <div className="current-admission-section">
                  <div className="section-title-sm">
                    <span
                      className={`pulse-indicator ${
                        currentAdmission.status === 'CONFIRMED'
                          ? 'bg-emerald'
                          : 'bg-amber'
                      }`}
                    ></span>
                    <span>Active Admission Record</span>
                  </div>

                  <div
                    className={`application-hero-card ${
                      currentAdmission.status === 'CONFIRMED'
                        ? 'card-confirmed'
                        : 'card-held'
                    }`}
                  >
                    <div className="app-card-header">
                      <div>
                        <span
                          className={`badge ${
                            currentAdmission.status === 'CONFIRMED'
                              ? 'badge-confirmed'
                              : 'badge-held'
                          }`}
                        >
                          {currentAdmission.status === 'CONFIRMED' ? (
                            <CheckCircleIcon width={16} height={16} />
                          ) : (
                            <ClockIcon width={16} height={16} />
                          )}{' '}
                          {currentAdmission.status}
                        </span>
                        <h2 className="app-card-title mt-2">
                          {currentAdmission.className}
                        </h2>
                        <div className="app-card-meta">
                          <span>
                            Application Code:{' '}
                            <code className="font-bold">
                              {currentAdmission.applicationCode ||
                                currentAdmission.holdId}
                            </code>
                          </span>
                          <span>&bull;</span>
                          <span>Date: {formatDate(currentAdmission.createdAt)}</span>
                        </div>
                      </div>

                      {currentAdmission.status === 'HELD' ? (
                        <div className="app-card-timer-box">
                          <span className="timer-label">Seat Reserved For:</span>
                          <div
                            className="timer-display-mini font-mono font-bold"
                            id="app-mini-countdown"
                          >
                            {formatTimeRemaining(remainingSeconds)}
                          </div>
                          <span className="timer-hint">
                            Auto-releases if unconfirmed
                          </span>
                        </div>
                      ) : (
                        <div className="app-card-confirmed-box">
                          <div className="confirmed-seal">
                            <CheckCircleIcon width={22} height={22} />
                            <span>Official Admission</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="app-card-actions">
                      <Link
                        to={`/applications/${currentAdmission.holdId}`}
                        className={`btn ${
                          currentAdmission.status === 'CONFIRMED'
                            ? 'btn-primary'
                            : 'btn-warning'
                        }`}
                      >
                        {currentAdmission.status === 'CONFIRMED'
                          ? 'View Admission Details & Slip'
                          : 'Manage Seat Hold & Pay Fee'}{' '}
                        <ArrowRightIcon width={16} height={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Historical Applications Section */}
              {historicalHolds.length > 0 && (
                <div className="history-section mt-5">
                  <div className="history-header-row">
                    <h3 className="section-title-sm">Previous Applications History</h3>
                    <div className="status-tabs">
                      <button
                        type="button"
                        className={`tab-btn ${
                          currentStatusFilter === 'ALL' ? 'active' : ''
                        }`}
                        onClick={() => setCurrentStatusFilter('ALL')}
                      >
                        All ({historicalHolds.length})
                      </button>
                      <button
                        type="button"
                        className={`tab-btn ${
                          currentStatusFilter === 'EXPIRED' ? 'active' : ''
                        }`}
                        onClick={() => setCurrentStatusFilter('EXPIRED')}
                      >
                        Expired
                      </button>
                      <button
                        type="button"
                        className={`tab-btn ${
                          currentStatusFilter === 'CANCELLED' ? 'active' : ''
                        }`}
                        onClick={() => setCurrentStatusFilter('CANCELLED')}
                      >
                        Cancelled
                      </button>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="app-history-table">
                      <thead>
                        <tr>
                          <th>Application Code</th>
                          <th>Class &amp; Shift</th>
                          <th>Status</th>
                          <th>Applied On</th>
                          <th>Resolution</th>
                          <th className="text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleHistory.map((h) => (
                          <tr key={h.holdId}>
                            <td className="font-mono font-semibold">
                              {h.applicationCode || h.holdId}
                            </td>
                            <td>{h.className}</td>
                            <td>
                              {h.status === 'EXPIRED' ? (
                                <span className="badge badge-expired">
                                  <AlertCircleIcon width={14} height={14} /> EXPIRED
                                </span>
                              ) : h.status === 'CANCELLED' ? (
                                <span className="badge badge-cancelled">
                                  <CloseIcon width={14} height={14} /> CANCELLED
                                </span>
                              ) : (
                                <span className="badge">{h.status}</span>
                              )}
                            </td>
                            <td>{formatDate(h.createdAt)}</td>
                            <td className="text-muted text-sm">
                              {h.status === 'EXPIRED'
                                ? 'Time expired, seat released'
                                : 'Cancelled by candidate'}
                            </td>
                            <td className="text-right">
                              <Link
                                to={`/applications/${h.holdId}`}
                                className="btn btn-outline btn-sm"
                              >
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyApplicationsPage;
