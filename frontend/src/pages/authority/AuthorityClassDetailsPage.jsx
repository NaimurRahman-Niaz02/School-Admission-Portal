/**
 * AuthorityClassDetailsPage.jsx - Class Roster Inspection & Student Profile Overviews
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { apiService } from '../../services/apiService';
import { AdminStudentDetailsModal } from '../../components/modals/AdminStudentDetailsModal';
import {
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  CheckIcon,
  AlertTriangleIcon,
} from '../../components/common/Icons';
import { formatDate, formatTimeRemaining } from '../../utils/formatters';

export function AuthorityClassDetailsPage() {
  const { classId } = useParams();

  const [rosterData, setRosterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

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

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const fetchRoster = async () => {
      try {
        const data = await apiService.getClassRoster(classId);
        if (isMounted) {
          setRosterData(data);
          setNotFound(false);
          document.title = `${data.classInfo?.name || 'Class Details'} — Authority Portal | Hashmat Uddin High School`;
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          if (err.status === 404) {
            setNotFound(true);
          } else {
            console.error('Error loading class roster:', err);
          }
          setIsLoading(false);
        }
      }
    };

    fetchRoster();

    return () => {
      isMounted = false;
    };
  }, [classId]);

  // 5-second polling interval
  useEffect(() => {
    let isMounted = true;

    const pollRoster = async () => {
      try {
        const data = await apiService.getClassRoster(classId);
        if (isMounted) {
          setRosterData(data);
        }
      } catch (err) {
        console.error('Polling class roster error:', err);
      }
    };

    const timer = setInterval(pollRoster, 5000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [classId]);

  const handleOpenStudentModal = async (holdId) => {
    try {
      const studentDetail = await apiService.getStudentAdmissionDetail(holdId);
      setSelectedStudent(studentDetail);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Could not load student record:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="authority-portal-wrapper">
        <div className="container authority-body">
          <div className="page-breadcrumbs mb-4">
            <Link to="/authority/admission-management">Dashboard</Link> /{' '}
            <Link to="/authority/statistics">Classes</Link> /{' '}
            <span>Class Details</span>
          </div>
          <div className="skeleton-line" style={{ width: '100%', height: '320px' }}></div>
        </div>
      </div>
    );
  }

  if (notFound || !rosterData?.classInfo) {
    return (
      <div className="authority-portal-wrapper">
        <div className="container authority-body">
          <div className="page-breadcrumbs mb-4">
            <Link to="/authority/admission-management">Dashboard</Link> /{' '}
            <Link to="/authority/statistics">Classes</Link> /{' '}
            <span>Class Details</span>
          </div>
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <AlertTriangleIcon width={44} height={44} />
            </div>
            <h3 className="empty-state-title">Class Not Found</h3>
            <p className="empty-state-description">
              Could not locate admission class &quot;{classId}&quot;.
            </p>
            <div className="empty-state-actions">
              <Link to="/authority/statistics" className="btn btn-primary">
                Back to Classes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { classInfo, admitted = [], reserved = [], history = [], isRosterAvailable } =
    rosterData;

  const totalSeats = classInfo.totalSeats || 0;
  const confirmedSeats = classInfo.confirmedSeats || 0;
  const heldSeats = classInfo.heldSeats || 0;
  const availableSeats = classInfo.availableSeats || 0;
  const fee = classInfo.fee || 1500;
  const revenueEstimate = confirmedSeats * fee;

  const confirmedPct =
    totalSeats > 0 ? (confirmedSeats / totalSeats) * 100 : 0;
  const heldPct = totalSeats > 0 ? (heldSeats / totalSeats) * 100 : 0;

  return (
    <div className="authority-portal-wrapper">
      <div className="container authority-body">
        {/* Breadcrumbs */}
        <div className="page-breadcrumbs mb-4">
          <Link to="/authority/admission-management">Dashboard</Link> /{' '}
          <Link to="/authority/statistics">Classes</Link> /{' '}
          <span id="detail-breadcrumb-title">{classInfo.name}</span>
        </div>

        <div id="class-detail-content-area">
          {/* Class Summary Banner */}
          <div className="class-detail-hero-card">
            <div className="class-hero-top">
              <div>
                <h1 className="class-hero-title">{classInfo.name}</h1>
                <div className="class-noticeable-meta mt-3">
                  <div className="class-noticeable-item">
                    <span className="meta-label">Shift:</span>
                    <strong className="meta-value text-primary">
                      {classInfo.shift || 'Morning'} Shift
                    </strong>
                  </div>
                  <div className="class-noticeable-item">
                    <span className="meta-label">Group:</span>
                    <strong className="meta-value text-primary">
                      {classInfo.group || 'General'}
                    </strong>
                  </div>
                  <div className="class-noticeable-item">
                    <span className="meta-label">Session:</span>
                    <strong className="meta-value text-primary">
                      {classInfo.session || 'Session 27'}
                    </strong>
                  </div>
                  <div className="class-noticeable-item">
                    <span className="meta-label">Fee:</span>
                    <strong className="meta-value text-emerald font-mono">
                      ৳{fee.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quota Counters Matrix */}
            <div className="class-hero-matrix mt-5">
              <div className="hero-matrix-box">
                <span className="matrix-box-label">Total Capacity</span>
                <span className="matrix-box-val">{totalSeats}</span>
              </div>
              <div className="hero-matrix-box">
                <span className="matrix-box-label">Admitted (Confirmed)</span>
                <span className="matrix-box-val text-teal font-bold">
                  {confirmedSeats}
                </span>
              </div>
              <div className="hero-matrix-box">
                <span className="matrix-box-label">Reserved (Held)</span>
                <span className="matrix-box-val text-amber font-bold">
                  {heldSeats}
                </span>
              </div>
              <div className="hero-matrix-box">
                <span className="matrix-box-label">Available Seats</span>
                <span className="matrix-box-val text-emerald font-bold">
                  {availableSeats}
                </span>
              </div>
              <div className="hero-matrix-box">
                <span className="matrix-box-label">Estimated Revenue</span>
                <span className="matrix-box-val text-emerald font-mono font-bold">
                  ৳{revenueEstimate.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="seat-progress-wrapper mt-4">
              <div className="seat-progress-bar" style={{ height: '12px' }}>
                <div
                  className="progress-segment confirmed"
                  style={{ width: `${confirmedPct}%` }}
                  title={`Admitted: ${confirmedSeats}`}
                ></div>
                <div
                  className="progress-segment held"
                  style={{ width: `${heldPct}%` }}
                  title={`Held: ${heldSeats}`}
                ></div>
              </div>
              <div className="seat-progress-legend">
                <span>{availableSeats} seats vacant</span>
                <span>{classInfo.occupancyRate || 0}% quota occupied</span>
              </div>
            </div>
          </div>

          {/* If Real API Mode and Roster Data is not available */}
          {!isRosterAvailable && (
            <div className="alert alert-info mt-6">
              <div className="alert-icon">
                <ClockIcon width={20} height={20} />
              </div>
              <div className="alert-body">
                <div>
                  <strong>Student Roster Notice:</strong> The official backend API provides class seat metrics but does not expose an endpoint for student rosters.
                </div>
                <div className="alert-subtext">
                  Authoritative live class counts ({confirmedSeats} admitted, {heldSeats} held) are reflected above.
                </div>
              </div>
            </div>
          )}

          {/* Admitted Students Table Section */}
          <div className="authority-card mt-8">
            <div className="card-header-styled flex-between">
              <div>
                <h3 className="card-title-styled" style={{ margin: 0 }}>
                  <span className="badge badge-confirmed">
                    <CheckCircleIcon width={14} height={14} />{' '}
                    {isRosterAvailable ? admitted.length : confirmedSeats} Admitted
                  </span>{' '}
                  Officially Enrolled Students
                </h3>
              </div>
              <span className="text-xs text-muted">Admission Fee Paid</span>
            </div>

            <div className="table-responsive">
              <table className="authority-table">
                <thead>
                  <tr>
                    <th>Candidate Birth Registration ID (17-Digit)</th>
                    <th>Application Code</th>
                    <th>Confirmed Timestamp</th>
                    <th>Fee Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!admitted.length ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        {!isRosterAvailable
                          ? 'Detailed student roster records are not exposed by the backend API.'
                          : 'No students have confirmed admission in this class yet.'}
                      </td>
                    </tr>
                  ) : (
                    admitted.map((s) => (
                      <tr
                        key={s.holdId}
                        className="clickable-student-row"
                        onClick={() => handleOpenStudentModal(s.holdId)}
                        title="Click to view student admission profile"
                      >
                        <td className="font-mono font-bold text-primary">
                          <span className="student-row-icon">
                            <UserIcon width={14} height={14} />
                          </span>{' '}
                          {s.studentId}
                        </td>
                        <td className="font-mono font-semibold">
                          {s.applicationCode || s.holdId}
                        </td>
                        <td className="text-sm">
                          {formatDate(s.confirmedAt || s.createdAt)}
                        </td>
                        <td>
                          <span className="badge badge-confirmed">
                            <CheckIcon width={12} height={12} /> PAID (Simulated)
                          </span>
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline btn-view-student"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStudentModal(s.holdId);
                            }}
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reserved (Held) Students Table Section */}
          <div className="authority-card mt-8">
            <div className="card-header-styled flex-between">
              <div>
                <h3 className="card-title-styled" style={{ margin: 0 }}>
                  <span className="badge badge-held">
                    <ClockIcon width={14} height={14} />{' '}
                    {isRosterAvailable ? reserved.length : heldSeats} Reserved
                  </span>{' '}
                  Active Temporary Seat Holds
                </h3>
              </div>
              <span className="text-xs text-muted">10-Minute Hold Window</span>
            </div>

            <div className="table-responsive">
              <table className="authority-table">
                <thead>
                  <tr>
                    <th>Candidate Birth Registration ID</th>
                    <th>Application Code</th>
                    <th>Reservation Initiated</th>
                    <th>Time Remaining</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!reserved.length ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5 text-muted">
                        {!isRosterAvailable
                          ? 'Detailed reservation roster records are not exposed by the backend API.'
                          : 'No active temporary seat holds for this class currently.'}
                      </td>
                    </tr>
                  ) : (
                    reserved.map((s) => {
                      const expTime = new Date(s.expiresAt).getTime();
                      const remSec = Math.max(
                        0,
                        Math.floor((expTime - currentTime) / 1000)
                      );

                      return (
                        <tr
                          key={s.holdId}
                          className="clickable-student-row"
                          onClick={() => handleOpenStudentModal(s.holdId)}
                          title="Click to view student admission profile"
                        >
                          <td className="font-mono font-bold text-primary">
                            <span className="student-row-icon">
                              <UserIcon width={14} height={14} />
                            </span>{' '}
                            {s.studentId}
                          </td>
                          <td className="font-mono font-semibold">
                            {s.applicationCode || s.holdId}
                          </td>
                          <td className="text-sm">{formatDate(s.createdAt)}</td>
                          <td>
                            <span className="timer-countdown-badge font-mono font-bold text-amber">
                              {formatTimeRemaining(remSec)}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline btn-view-student"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenStudentModal(s.holdId);
                              }}
                            >
                              View Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Previous Applications History */}
          {history.length > 0 && (
            <div className="authority-card mt-8">
              <div className="card-header-styled">
                <h3 className="card-title-styled text-muted">
                  Application History ({history.length} Expired / Cancelled)
                </h3>
                <p className="card-subtitle-styled">
                  Seats that were previously reserved and released back to open quota
                </p>
              </div>
              <div className="table-responsive">
                <table className="authority-table">
                  <thead>
                    <tr>
                      <th>Candidate ID</th>
                      <th>Application Code</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((s) => (
                      <tr
                        key={s.holdId}
                        className="clickable-student-row"
                        onClick={() => handleOpenStudentModal(s.holdId)}
                      >
                        <td className="font-mono">{s.studentId}</td>
                        <td className="font-mono font-semibold">
                          {s.applicationCode || s.holdId}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              s.status === 'EXPIRED'
                                ? 'badge-expired'
                                : 'badge-cancelled'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="text-sm text-muted">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline btn-view-student"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenStudentModal(s.holdId);
                            }}
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Student Admission Record Modal Popup */}
      <AdminStudentDetailsModal
        isOpen={isModalOpen}
        student={selectedStudent}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
      />
    </div>
  );
}

export default AuthorityClassDetailsPage;
