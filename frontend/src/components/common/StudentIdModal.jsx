/**
 * StudentIdModal.jsx - Interactive 17-digit Student ID Modal Dialog
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useEffect } from 'react';
import { useStudent } from '../../context/useStudent';
import { useToast } from '../../context/useToast';
import { isValid17DigitId } from '../../utils/formatters';
import { CloseIcon } from './Icons';

function StudentIdDialog({ currentId, defaultRemember, onClose, onSave }) {
  const [inputVal, setInputVal] = useState(currentId || '');
  const [remember, setRemember] = useState(defaultRemember);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 17);
    setInputVal(raw);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = inputVal.trim();

    if (!clean) {
      setError('Please enter your 17-digit birth registration number.');
      return;
    }

    if (!isValid17DigitId(clean)) {
      setError(`Must contain exactly 17 numeric digits. (Currently: ${clean.length} digits)`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(clean, remember);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update student ID.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      id="modal-backdrop"
      className="modal-backdrop modal-visible"
      onClick={(e) => {
        if (e.target.id === 'modal-backdrop') {
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {currentId ? 'Change Student ID' : 'Student Identification'}
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

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p className="modal-intro">
              Please enter your official <strong>17-digit birth registration number</strong> to access reservations and track applications.
            </p>

            <div className="form-group">
              <label htmlFor="student-id-input" className="form-label">
                Birth Registration Number (17 digits)
              </label>
              <div className="input-with-counter">
                <input
                  type="text"
                  id="student-id-input"
                  className="form-control font-mono"
                  placeholder="e.g. 20081234567890123"
                  value={inputVal}
                  onChange={handleChange}
                  maxLength={17}
                  autoComplete="off"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoFocus
                />
                <div id="student-id-counter" className="input-counter">
                  {inputVal.length}/17
                </div>
              </div>
              {error && (
                <div id="student-id-error" className="form-error">
                  {error}
                </div>
              )}
              <p className="form-hint">
                Must contain exactly 17 numeric digits with no spaces or special characters.
              </p>
            </div>

            <div className="form-group mb-0">
              <label className="form-check">
                <input
                  type="checkbox"
                  id="student-id-remember"
                  className="form-check-input"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span className="form-check-label">Remember student ID on this device</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Student ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StudentIdModal() {
  const { studentId, rememberStudent, isIdentityModalOpen, closeIdentityModal, setStudentId } = useStudent();
  const { showToast } = useToast();

  if (!isIdentityModalOpen) return null;

  const handleSave = async (cleanId, remember) => {
    await setStudentId(cleanId, remember);
    showToast('Student identification updated successfully.', 'success');
  };

  return (
    <StudentIdDialog
      currentId={studentId}
      defaultRemember={rememberStudent}
      onClose={closeIdentityModal}
      onSave={handleSave}
    />
  );
}

export default StudentIdModal;
