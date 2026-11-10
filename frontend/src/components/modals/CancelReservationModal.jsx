/**
 * CancelReservationModal.jsx - Confirmation dialog for cancelling seat reservation
 * Hashmat Uddin High School Online Admission System
 */

import { useState } from 'react';
import { CloseIcon, AlertTriangleIcon } from '../common/Icons';

export function CancelReservationModal({ isOpen, hold, onClose, onConfirm }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !hold) return null;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-backdrop"
      className="modal-backdrop modal-visible"
      onClick={(e) => {
        if (e.target.id === 'modal-backdrop' && !isSubmitting) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-modal-title"
      >
        <div className="modal-header">
          <h2 id="cancel-modal-title" className="modal-title">
            Cancel Seat Reservation
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <div className="cancel-modal-content">
            <p>
              Are you sure you want to cancel your seat reservation for{' '}
              <strong>{hold.className || 'this class'}</strong>?
            </p>
            <div className="alert alert-warning mt-2">
              <div className="alert-icon">
                <AlertTriangleIcon />
              </div>
              <div className="alert-body">
                The held seat will be immediately released and returned to the school&apos;s available pool for other students to reserve.
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Keep Reservation
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-sm"></span> Cancelling...
              </>
            ) : (
              'Yes, Cancel Reservation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CancelReservationModal;

