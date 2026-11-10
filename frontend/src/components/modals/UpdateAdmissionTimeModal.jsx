/**
 * UpdateAdmissionTimeModal.jsx - Admission Schedule Configuration Modal (Session 2027)
 * Hashmat Uddin High School Online Admission System
 */

import { useState } from 'react';
import { CloseIcon, ClockIcon } from '../common/Icons';

function UpdateAdmissionTimeDialog({ currentTimeline, onClose, onSave }) {
  const formatForInput = (isoStr) => {
    try {
      const d = new Date(isoStr);
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  const [startDateStr, setStartDateStr] = useState(() =>
    formatForInput(currentTimeline?.startDate || '2026-11-01T08:00:00.000Z')
  );
  const [endDateStr, setEndDateStr] = useState(() =>
    formatForInput(currentTimeline?.endDate || '2026-11-30T23:59:59.000Z')
  );
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e) => {
    e?.preventDefault();
    setError('');

    if (!startDateStr || !endDateStr) {
      setError('Please specify both start and closing dates/times.');
      return;
    }

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid date/time format entered.');
      return;
    }

    if (end.getTime() <= start.getTime()) {
      setError('Closing date must be strictly after the start date.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update schedule.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      id="modal-backdrop"
      className="modal-backdrop modal-visible"
      onClick={(e) => {
        if (e.target.id === 'modal-backdrop' && !isSaving) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timeline-modal-title"
      >
        <div className="modal-header">
          <h2 id="timeline-modal-title" className="modal-title">
            Update Admission Time — Session 2027
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <form id="timeline-modal-form" onSubmit={handleSave} noValidate>
            <div className="form-group mb-4">
              <label
                className="form-label"
                htmlFor="timeline-start-input"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ClockIcon width={16} height={16} /> Admission Start Date &amp; Time
              </label>
              <input
                type="datetime-local"
                id="timeline-start-input"
                className="form-control"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-4">
              <label
                className="form-label"
                htmlFor="timeline-end-input"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ClockIcon width={16} height={16} /> Admission Closing Date &amp; Time
              </label>
              <input
                type="datetime-local"
                id="timeline-end-input"
                className="form-control"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                required
              />
            </div>

            {error && (
              <div
                id="timeline-modal-error"
                className="form-error-msg"
                style={{
                  display: 'block',
                  color: '#ef4444',
                  fontSize: '0.8125rem',
                  marginTop: '8px',
                }}
              >
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner-sm"></span> Saving...
              </>
            ) : (
              'Save Admission Time'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function UpdateAdmissionTimeModal({
  isOpen,
  currentTimeline,
  onClose,
  onSave,
}) {
  if (!isOpen) return null;
  return (
    <UpdateAdmissionTimeDialog
      currentTimeline={currentTimeline}
      onClose={onClose}
      onSave={onSave}
    />
  );
}

export default UpdateAdmissionTimeModal;
