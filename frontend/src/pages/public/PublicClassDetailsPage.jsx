/**
 * PublicClassDetailsPage.jsx - Public Class Details and Seat Reservation
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { useStudent } from '../../context/useStudent';
import { useToast } from '../../context/useToast';
import { apiService } from '../../services/apiService';
import {
  ArrowRightIcon,
  AlertTriangleIcon,
  UserIcon,
} from '../../components/common/Icons';
import {
  isValid17DigitId,
  formatDhms,
} from '../../utils/formatters';

export function PublicClassDetailsPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { studentId, setStudentId } = useStudent();
  const { showToast } = useToast();

  const [classItem, setClassItem] = useState(null);
  const [studentSummary, setStudentSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Form input state
  const [inputStudentId, setInputStudentId] = useState(studentId || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [isReserving, setIsReserving] = useState(false);

  // Schedule clock state
  const [clockInfo, setClockInfo] = useState({
    title: 'Session 27 Admission Schedule',
    val: 'Loading...',
    hint: '',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Fetch initial class data
  useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      try {
        const cls = await apiService.getClassById(classId);
        if (isMounted) {
          setClassItem(cls);
          setNotFound(false);
          document.title = `${cls.name} | Hashmat Uddin High School`;
          setIsLoading(false);
        }

        const activeId = studentId || '';
        if (activeId && isValid17DigitId(activeId)) {
          const summary = await apiService.getStudentAdmissionSummary(activeId);
          if (isMounted) {
            setStudentSummary(summary);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.status === 404) {
            setNotFound(true);
          } else {
            console.error('Error loading class:', err);
          }
          setIsLoading(false);
        }
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [classId, studentId]);

  // 5-second polling for live seat stats
  useEffect(() => {
    let isMounted = true;

    const pollStats = async () => {
      try {
        const cls = await apiService.getClassById(classId);
        if (isMounted) {
          setClassItem(cls);
        }

        const activeId = studentId || '';
        if (activeId && isValid17DigitId(activeId)) {
          const summary = await apiService.getStudentAdmissionSummary(activeId);
          if (isMounted) {
            setStudentSummary(summary);
          }
        }
      } catch (err) {
        console.error('Polling class details error:', err);
      }
    };

    const pollTimer = setInterval(pollStats, 5000);
    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [classId, studentId]);

  // 1-second admission schedule clock ticker
  useEffect(() => {
    if (!classItem) return;

    const startDate = new Date(
      classItem.admissionStartDate || '2026-11-01T08:00:00Z'
    ).getTime();
    const endDate = new Date(
      classItem.admissionEndDate || '2026-11-30T23:59:59Z'
    ).getTime();

    const updateClock = () => {
      const now = Date.now();
      if (now < startDate) {
        setClockInfo({
          title: 'Admission Starts In:',
          val: formatDhms(startDate - now),
          hint: 'Seat reservation opens when timer hits zero',
        });
      } else if (now >= startDate && now <= endDate) {
        setClockInfo({
          title: 'Admission Open • Closes In:',
          val: formatDhms(endDate - now),
          hint: 'First-come, first-served allocation currently in progress',
        });
      } else {
        setClockInfo({
          title: 'Admission Closed',
          val: 'Application window closed',
          hint: 'Session 27 seat allocation is finished',
        });
      }
    };

    updateClock();
    const clockTimer = setInterval(updateClock, 1000);
    return () => clearInterval(clockTimer);
  }, [classItem]);

  const handleUseSampleId = () => {
    const sampleId = '20080123456789012';
    setInputStudentId(sampleId);
    setErrorMsg('');
  };

  const handleReserve = async (e) => {
    e?.preventDefault();
    setErrorMsg('');

    const cleanId = (inputStudentId || '').trim();

    if (!cleanId) {
      setErrorMsg('Please enter your 17-digit birth registration number.');
      return;
    }

    if (!isValid17DigitId(cleanId)) {
      setErrorMsg(
        'Please enter a valid 17-digit birth registration number (digits only).'
      );
      return;
    }

    // Save active student ID in context and localStorage
    setStudentId(cleanId);

    // Check student single-admission status
    try {
      const summary = await apiService.getStudentAdmissionSummary(cleanId);
      if (!summary.canApply) {
        if (summary.admissionState === 'CONFIRMED') {
          setErrorMsg(
            `Admission already confirmed: You have confirmed admission in "${summary.currentApplication.className}". You cannot apply to another class.`
          );
          showToast(
            `Admission already confirmed in ${summary.currentApplication.className}.`,
            'error'
          );
          return;
        }

        if (summary.admissionState === 'HELD') {
          if (summary.currentApplication.classId === classItem.id) {
            navigate(`/applications/${summary.currentApplication.holdId}`);
            return;
          }
          setErrorMsg(
            `Active reservation exists: You already have a seat held in "${summary.currentApplication.className}". You must cancel it before selecting this class.`
          );
          showToast(
            `Active reservation in ${summary.currentApplication.className}. Cancel it first.`,
            'warning'
          );
          return;
        }
      }

      // Check class availability
      if (classItem.availableSeats <= 0) {
        setErrorMsg('Sorry, this class is now full.');
        showToast('This class is currently full.', 'warning');
        return;
      }

      setIsReserving(true);

      const holdResult = await apiService.createHold(classItem.id, cleanId);
      showToast(`Seat reserved in ${classItem.name}!`, 'success');
      navigate(`/applications/${holdResult.holdId}`);
    } catch (err) {
      setIsReserving(false);
      setErrorMsg(err.message || 'Failed to initiate reservation.');
      showToast(err.message || 'Failed to initiate reservation.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="admission-page-wrapper">
        <div className="container">
          <div className="admission-breadcrumbs mb-4">
            <Link to="/">Home</Link> <span className="breadcrumb-separator">/</span>{' '}
            <Link to="/admissions/classes">Admission Classes</Link> <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">Class Details</span>
          </div>
          <div className="skeleton-line" style={{ width: '100%', height: '360px' }}></div>
        </div>
      </div>
    );
  }

  if (notFound || !classItem) {
    return (
      <div className="admission-page-wrapper">
        <div className="container">
          <div className="admission-breadcrumbs mb-4">
            <Link to="/">Home</Link> <span className="breadcrumb-separator">/</span>{' '}
            <Link to="/admissions/classes">Admission Classes</Link> <span className="breadcrumb-separator">/</span>{' '}
            <span className="breadcrumb-current">Class Details</span>
          </div>
          <div className="empty-state-box">
            <div className="empty-state-icon">
              <AlertTriangleIcon width={44} height={44} />
            </div>
            <h3 className="empty-state-title">Class Not Found</h3>
            <p className="empty-state-description">
              We could not locate admission class &quot;{classId}&quot;.
            </p>
            <div className="empty-state-actions">
              <Link to="/admissions/classes" className="btn btn-primary">
                Back to Classes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isHigherGrade = classItem.grade === 'Class 9' || classItem.grade === 'Class 10';
  const isFull = classItem.availableSeats <= 0;

  let statusPillClass = 'pill-available';
  let statusPillLabel = 'Available';
  if (isFull) {
    statusPillClass = 'pill-full';
    statusPillLabel = 'Class Full';
  } else if (classItem.status === 'Limited Seats') {
    statusPillClass = 'pill-limited';
    statusPillLabel = 'Limited Seats';
  }

  const confirmedPct =
    classItem.totalSeats > 0 ? (classItem.confirmedSeats / classItem.totalSeats) * 100 : 0;
  const heldPct =
    classItem.totalSeats > 0 ? (classItem.heldSeats / classItem.totalSeats) * 100 : 0;

  return (
    <div className="admission-page-wrapper">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="admission-breadcrumbs mb-4">
          <Link to="/">Home</Link> <span className="breadcrumb-separator">/</span>{' '}
          <Link to="/admissions/classes">Admission Classes</Link>{' '}
          <span className="breadcrumb-separator">/</span>{' '}
          <span className="breadcrumb-current">{classItem.name}</span>
        </div>

        <div className="public-class-detail-grid">
          {/* Left Column: Specs, Counts, Capacity */}
          <div className="class-detail-main">
            {/* Seat Counts Matrix */}
            <div className="class-counts-matrix-card mb-6">
              <h3 className="counts-title">Seat Availability Breakdown</h3>
              <div className="counts-grid-four">
                <div className="count-box">
                  <span className="count-lbl">Total Capacity</span>
                  <span className="count-num font-bold" id="stat-total-seats">
                    {classItem.totalSeats}
                  </span>
                  <span className="count-sub">Total Seats</span>
                </div>
                <div className="count-box highlight-emerald">
                  <span className="count-lbl">Available Seats</span>
                  <span
                    className="count-num text-emerald font-bold"
                    id="stat-avail-seats"
                  >
                    {classItem.availableSeats}
                  </span>
                  <span className="count-sub">Open for Hold</span>
                </div>
                <div className="count-box highlight-amber">
                  <span className="count-lbl">Currently Held</span>
                  <span
                    className="count-num text-amber font-bold"
                    id="stat-held-seats"
                  >
                    {classItem.heldSeats}
                  </span>
                  <span className="count-sub">10-Min Hold</span>
                </div>
                <div className="count-box highlight-teal">
                  <span className="count-lbl">Admitted</span>
                  <span
                    className="count-num text-teal font-bold"
                    id="stat-confirmed-seats"
                  >
                    {classItem.confirmedSeats}
                  </span>
                  <span className="count-sub">Confirmed Fee</span>
                </div>
              </div>

              {/* Visual Progress Meter */}
              <div className="seat-progress-bar mt-4" style={{ height: '10px' }}>
                <div
                  className="progress-segment confirmed"
                  id="progress-confirmed-seg"
                  style={{ width: `${confirmedPct}%` }}
                ></div>
                <div
                  className="progress-segment held"
                  id="progress-held-seg"
                  style={{ width: `${heldPct}%` }}
                ></div>
              </div>
              <div className="seat-progress-legend mt-2 flex-between text-xs text-muted">
                <span id="stat-legend-avail">{classItem.availableSeats} seats open</span>
                <span id="stat-legend-occupied">
                  {classItem.occupancyRate || 0}% quota occupied
                </span>
              </div>
            </div>

            {/* Academic Specifications */}
            <div className="class-specs-card">
              <h3 className="specs-title">Academic Specifications</h3>
              <div className="specs-list-grid">
                <div className="spec-row">
                  <span className="spec-lbl">Academic Session</span>
                  <span className="spec-txt font-semibold">
                    {classItem.session || 'Session 27'}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-lbl">Class / Grade</span>
                  <span className="spec-txt font-semibold">{classItem.grade}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-lbl">Shift &amp; Hours</span>
                  <span className="spec-txt font-semibold">
                    {classItem.shift || 'Morning'} Shift (
                    {classItem.shift === 'Day'
                      ? '12:30 PM – 05:00 PM'
                      : '07:30 AM – 12:00 PM'}
                    )
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-lbl">Discipline Group</span>
                  <span className="spec-txt font-semibold">
                    {classItem.group || (isHigherGrade ? 'Science' : 'General')}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-lbl">Admission Fee</span>
                  <span className="spec-txt font-bold text-emerald font-mono">
                    ৳{(classItem.fee || 1500).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Clock & Reservation Card */}
          <div className="class-detail-sidebar">
            <div className="reservation-box-sticky">
              {/* Live Admission Schedule Clock */}
              <div className="class-schedule-clock-card hero-timer-bright mb-6">
                <div className="timer-label-row flex-between align-center">
                  <div className="flex-align-center gap-2">
                    <span className="timer-dot-pulse"></span>
                    <span className="timer-heading" id="class-clock-title">
                      {clockInfo.title}
                    </span>
                  </div>
                  <span id="class-clock-pill">
                    <span className={`availability-pill ${statusPillClass}`}>
                      <span className="pill-dot"></span>
                      {statusPillLabel}
                    </span>
                  </span>
                </div>
                <div
                  className="timer-countdown-val font-mono"
                  id="class-live-clock"
                >
                  {clockInfo.val}
                </div>
                <div className="timer-subtitle" id="class-clock-hint">
                  {clockInfo.hint}
                </div>
              </div>

              {/* Reservation Card */}
              <div className="sidebar-card">
                <h3 className="sidebar-title mb-4">Seat Reservation</h3>

                {/* Conflict Notice if student has existing hold or confirmed */}
                {studentSummary?.admissionState === 'CONFIRMED' && (
                  <div className="alert alert-success mb-4">
                    <div className="text-xs">
                      <strong>Admission already confirmed:</strong> You are already enrolled in{' '}
                      <strong>{studentSummary.currentApplication?.className}</strong>.
                    </div>
                  </div>
                )}

                {studentSummary?.admissionState === 'HELD' &&
                  studentSummary.currentApplication?.classId !== classItem.id && (
                    <div className="alert alert-warning mb-4">
                      <div className="text-xs">
                        <strong>Active reservation:</strong> You already have a seat held in{' '}
                        <strong>{studentSummary.currentApplication?.className}</strong>. You must cancel it before choosing this class.
                      </div>
                    </div>
                  )}

                <div className="reservation-form-group mb-4">
                  <div className="flex-between align-center mb-1">
                    <label
                      htmlFor="reservation-student-id"
                      className="form-label font-semibold mb-0"
                    >
                      Student Birth Registration ID
                    </label>
                    <button
                      type="button"
                      className="btn-text-sm"
                      id="btn-fill-demo-id"
                      title="Use valid sample 17-digit ID for demonstration"
                      onClick={handleUseSampleId}
                    >
                      Use Sample ID
                    </button>
                  </div>

                  <div className="input-with-icon">
                    <span className="input-icon">
                      <UserIcon />
                    </span>
                    <input
                      type="text"
                      id="reservation-student-id"
                      className="form-control font-mono"
                      placeholder="Enter 17-digit Birth ID"
                      maxLength={17}
                      value={inputStudentId}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 17);
                        setInputStudentId(val);
                        setErrorMsg('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleReserve();
                        }
                      }}
                      autoComplete="off"
                      inputMode="numeric"
                    />
                  </div>

                  {errorMsg && (
                    <div
                      id="reservation-id-error"
                      className="reservation-error-text mt-2 text-danger text-xs"
                      style={{ display: 'block' }}
                    >
                      {errorMsg}
                    </div>
                  )}
                </div>

                <div className="reservation-fee-row mb-4 flex-between align-baseline">
                  <span className="fee-lbl font-semibold">Admission Fee</span>
                  <span className="fee-val text-emerald font-bold font-mono">
                    ৳{(classItem.fee || 1500).toLocaleString()}
                  </span>
                </div>

                <div className="reservation-btn-wrap">
                  {studentSummary?.admissionState === 'CONFIRMED' ? (
                    <Link
                      to="/my-applications"
                      className="btn btn-secondary btn-lg btn-block"
                    >
                      View Confirmed Admission
                    </Link>
                  ) : studentSummary?.admissionState === 'HELD' &&
                    studentSummary.currentApplication?.classId === classItem.id ? (
                    <Link
                      to={`/applications/${studentSummary.currentApplication.holdId}`}
                      className="btn btn-warning btn-lg btn-block"
                    >
                      View Your Active Hold &rarr;
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary btn-lg btn-block"
                      id="btn-reserve-this-class"
                      disabled={isReserving || isFull}
                      onClick={handleReserve}
                    >
                      {isReserving ? (
                        <>
                          <span className="spinner-sm"></span> Reserving...
                        </>
                      ) : isFull ? (
                        'Class Full'
                      ) : (
                        <>
                          Reserve a Seat <ArrowRightIcon width={18} height={18} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicClassDetailsPage;
