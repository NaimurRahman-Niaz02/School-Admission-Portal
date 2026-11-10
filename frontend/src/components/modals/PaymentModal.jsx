/**
 * PaymentModal.jsx - Simulated Admission Fee Payment Confirmation Dialog
 * Hashmat Uddin High School Online Admission System
 */

import { useState } from 'react';
import { maskStudentId } from '../../utils/formatters';
import { CloseIcon } from '../common/Icons';

export function PaymentModal({ isOpen, hold, onClose, onConfirm }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !hold) return null;

  const classFee = hold.classInfo?.fee || hold.fee || 1500;

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
        aria-labelledby="payment-modal-title"
      >
        <div className="modal-header">
          <h2 id="payment-modal-title" className="modal-title">
            Confirm Admission Payment
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
          <div className="payment-modal-content">
            <div className="payment-summary-card">
              <div className="payment-row">
                <span className="text-muted">Application Code:</span>
                <span className="font-mono font-semibold">
                  {hold.applicationCode || hold.holdId}
                </span>
              </div>
              <div className="payment-row">
                <span className="text-muted">Selected Class:</span>
                <span className="font-semibold">{hold.className}</span>
              </div>
              <div className="payment-row">
                <span className="text-muted">Student ID:</span>
                <span className="font-mono">{maskStudentId(hold.studentId)}</span>
              </div>
              <div className="payment-divider"></div>
              <div className="payment-row total-row">
                <span className="font-semibold">Admission Fee:</span>
                <span className="fee-amount">৳{classFee.toLocaleString()}</span>
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
            Go Back
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-sm"></span> Processing Confirmation...
              </>
            ) : (
              'Confirm Payment & Finalize Admission'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;

