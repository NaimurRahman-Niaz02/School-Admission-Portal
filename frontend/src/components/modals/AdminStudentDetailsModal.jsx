/**
 * AdminStudentDetailsModal.jsx - Admin Student Admission Record / Profile Dialog
 * Hashmat Uddin High School Online Admission System
 */

import {
  CloseIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
} from '../common/Icons';
import { formatDate } from '../../utils/formatters';

export function AdminStudentDetailsModal({ isOpen, student, onClose }) {
  if (!isOpen || !student) return null;

  const isConfirmed = student.status === 'CONFIRMED';
  const isHeld = student.status === 'HELD';
  const isExpired = student.status === 'EXPIRED';

  let statusBadge;
  if (isConfirmed) {
    statusBadge = (
      <span className="badge badge-confirmed">
        <CheckCircleIcon width={14} height={14} /> CONFIRMED ADMISSION
      </span>
    );
  } else if (isHeld) {
    statusBadge = (
      <span className="badge badge-held">
        <ClockIcon width={14} height={14} /> ACTIVE SEAT HOLD
      </span>
    );
  } else if (isExpired) {
    statusBadge = (
      <span className="badge badge-expired">
        <AlertCircleIcon width={14} height={14} /> EXPIRED HOLD
      </span>
    );
  } else {
    statusBadge = (
      <span className="badge badge-cancelled">
        <CloseIcon width={14} height={14} /> {student.status}
      </span>
    );
  }

  return (
    <div
      id="modal-backdrop"
      className="modal-backdrop modal-visible"
      onClick={(e) => {
        if (e.target.id === 'modal-backdrop') {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-modal-title"
      >
        <div className="modal-header">
          <h2 id="student-modal-title" className="modal-title">
            Student Admission Profile
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="admin-student-profile-dialog">
            <div className="profile-status-header">
              <div className="profile-avatar">
                <UserIcon width={32} height={32} />
              </div>
              <div className="profile-title-col">
                <div className="profile-badge-row">{statusBadge}</div>
                <h3 className="profile-student-name">
                  Student Birth Registration Record
                </h3>
                <p className="profile-student-id font-mono">
                  {student.studentId}
                </p>
              </div>
            </div>

            <div className="profile-grid">
              <div className="profile-item">
                <span className="profile-item-lbl">Application Code</span>
                <span className="profile-item-val font-mono font-bold">
                  {student.applicationCode || student.holdId}
                </span>
              </div>
              <div className="profile-item">
                <span className="profile-item-lbl">Academic Session</span>
                <span className="profile-item-val font-semibold">
                  {student.session || 'Session 27'}
                </span>
              </div>
              <div className="profile-item">
                <span className="profile-item-lbl">Allocated Class</span>
                <span className="profile-item-val font-semibold text-primary">
                  {student.className || student.classInfo?.name || 'Class'}
                </span>
              </div>
              <div className="profile-item">
                <span className="profile-item-lbl">Grade &amp; Shift</span>
                <span className="profile-item-val">
                  {student.grade || student.classInfo?.grade || '—'} &bull;{' '}
                  {student.shift || student.classInfo?.shift || 'Morning'} Shift
                </span>
              </div>
              <div className="profile-item">
                <span className="profile-item-lbl">Discipline Group</span>
                <span className="profile-item-val font-semibold">
                  {student.group || student.classInfo?.group || 'General'}
                </span>
              </div>
              <div className="profile-item">
                <span className="profile-item-lbl">Admission Fee Status</span>
                <span
                  className={`profile-item-val ${
                    isConfirmed
                      ? 'text-emerald font-bold'
                      : 'text-amber font-semibold'
                  }`}
                >
                  {isConfirmed
                    ? 'PAID (Simulated Confirmation)'
                    : 'PENDING PAYMENT'}
                </span>
              </div>
              <div className="profile-item">
                <span className="profile-item-lbl">Reservation Initiated</span>
                <span className="profile-item-val text-sm">
                  {formatDate(student.createdAt)}
                </span>
              </div>
              <div className="profile-item">
                <span className="profile-item-lbl">
                  {isConfirmed ? 'Confirmation Date' : 'Reservation Expiration'}
                </span>
                <span className="profile-item-val text-sm font-semibold">
                  {isConfirmed
                    ? formatDate(student.confirmedAt)
                    : formatDate(student.expiresAt)}
                </span>
              </div>
            </div>

            {isHeld && (
              <div className="alert alert-warning mt-3">
                <div className="alert-icon">
                  <ClockIcon width={18} height={18} />
                </div>
                <div className="alert-body">
                  <strong>Temporary Seat Lock:</strong> This candidate&apos;s seat is currently held. If not confirmed, the seat will auto-release back to open quota.
                </div>
              </div>
            )}

            {isConfirmed && (
              <div className="alert alert-success mt-3">
                <div className="alert-icon">
                  <CheckCircleIcon width={18} height={18} />
                </div>
                <div className="alert-body">
                  <strong>Officially Enrolled:</strong> Candidate seat quota is confirmed and locked for Academic Session 2026–2027.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminStudentDetailsModal;
