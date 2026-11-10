/**
 * ClassCard.jsx - Class Selection Card Component
 * Displays class details, 4-tier seat quota matrix, and admission action button
 * Hashmat Uddin High School Online Admission System
 */

import { Link } from 'react-router';
import { ArrowRightIcon } from './Icons';
import { formatTimeRemaining } from '../../utils/formatters';

export function ClassCard({ classItem, studentState }) {
  const {
    id,
    name,
    grade,
    shift,
    group,
    totalSeats = 0,
    heldSeats = 0,
    confirmedSeats = 0,
    availableSeats = 0,
    status = 'Available',
  } = classItem;

  const isFull = availableSeats <= 0 || status === 'Full';
  let statusClass = 'pill-available';
  let statusLabel = 'Available';
  if (isFull) {
    statusClass = 'pill-full';
    statusLabel = 'Class Full';
  } else if (status === 'Limited Seats') {
    statusClass = 'pill-limited';
    statusLabel = 'Limited Seats';
  }

  const isHigherGrade = grade === 'Class 9' || grade === 'Class 10';
  const displayGroup = group || (isHigherGrade ? 'Science' : null);
  const displayShift = shift || (/day/i.test(name) ? 'Day' : 'Morning');

  const confirmedPct = totalSeats > 0 ? (confirmedSeats / totalSeats) * 100 : 0;
  const heldPct = totalSeats > 0 ? (heldSeats / totalSeats) * 100 : 0;

  const renderActionButton = () => {
    if (studentState?.admissionState === 'CONFIRMED') {
      return (
        <Link
          to="/my-applications"
          className="btn btn-secondary btn-block"
          title="You already have confirmed admission"
        >
          Admission Confirmed
        </Link>
      );
    }

    if (studentState?.admissionState === 'HELD') {
      const isCurrentHeld = studentState.currentApplication?.classId === id;
      if (isCurrentHeld) {
        const remSec = studentState.currentApplication.remainingSeconds;
        return (
          <Link
            to={`/applications/${studentState.currentApplication.holdId}`}
            className="btn btn-warning btn-block"
          >
            View Your Hold ({remSec > 0 ? formatTimeRemaining(remSec) : 'Active'})
          </Link>
        );
      }
      return (
        <Link
          to={`/admissions/classes/${id}`}
          className="btn btn-outline btn-block"
          title="View details of this class"
        >
          View Class Details &rarr;
        </Link>
      );
    }

    if (isFull) {
      return (
        <Link
          to={`/admissions/classes/${id}`}
          className="btn btn-secondary btn-block"
        >
          Class Full (Details)
        </Link>
      );
    }

    return (
      <Link
        to={`/admissions/classes/${id}`}
        className="btn btn-primary btn-block"
      >
        Select This Class <ArrowRightIcon width={16} height={16} />
      </Link>
    );
  };

  return (
    <article
      className={`class-card ${isFull ? 'class-card-full' : ''}`}
      data-class-id={id}
    >
      <div className="class-card-header">
        <h3 className="class-card-title">{name}</h3>
        <span className={`availability-pill ${statusClass}`}>
          <span className="pill-dot"></span>
          {statusLabel}
        </span>
      </div>

      <div className="card-meta-line">
        <span className="card-meta-shift font-bold">{displayShift} Shift</span>
        {isHigherGrade && displayGroup ? (
          <span className="card-meta-group font-bold">{displayGroup} Group</span>
        ) : (
          <span></span>
        )}
      </div>

      {/* 4-Column Seat Quota Matrix: Total, Held, Confirmed, Available */}
      <div className="class-seat-matrix">
        <div className="matrix-item">
          <span className="matrix-val font-bold">{totalSeats}</span>
          <span className="matrix-lbl font-semibold">Total</span>
        </div>
        <div className="matrix-item">
          <span className="matrix-val text-amber font-bold">{heldSeats}</span>
          <span className="matrix-lbl font-semibold">Held</span>
        </div>
        <div className="matrix-item">
          <span className="matrix-val text-primary font-bold">{confirmedSeats}</span>
          <span className="matrix-lbl font-semibold">Confirmed</span>
        </div>
        <div className="matrix-item is-available">
          <span className="matrix-val text-emerald font-bold available-number">
            {availableSeats}
          </span>
          <span className="matrix-lbl font-semibold text-emerald">Available</span>
        </div>
      </div>

      {/* Seat Progress Utilization Bar */}
      <div className="seat-progress-wrapper" style={{ marginBottom: '12px' }}>
        <div className="seat-progress-bar" style={{ height: '6px' }}>
          <div
            className="progress-segment confirmed"
            style={{ width: `${confirmedPct}%` }}
            title={`Confirmed: ${confirmedSeats}`}
          ></div>
          <div
            className="progress-segment held"
            style={{ width: `${heldPct}%` }}
            title={`Held: ${heldSeats}`}
          ></div>
        </div>
      </div>

      <div className="class-card-actions">
        {renderActionButton()}
      </div>
    </article>
  );
}

export default ClassCard;

