/**
 * ToastProvider.jsx - Global Notification Toast Provider Component
 * Hashmat Uddin High School Online Admission System
 */

import { useState, useCallback } from 'react';
import { ToastContext } from './ToastContext';
import { InfoIcon, CheckCircleIcon, AlertCircleIcon, AlertTriangleIcon, CloseIcon } from '../components/common/Icons';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, message, type, isExiting: false };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
        );
        setTimeout(() => {
          removeToast(id);
        }, 250);
      }, duration);
    }
  }, [removeToast]);

  const handleDismiss = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    setTimeout(() => {
      removeToast(id);
    }, 250);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toast-container" className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          let icon = <InfoIcon />;
          if (toast.type === 'success') icon = <CheckCircleIcon />;
          else if (toast.type === 'error') icon = <AlertCircleIcon />;
          else if (toast.type === 'warning') icon = <AlertTriangleIcon />;

          return (
            <div
              key={toast.id}
              className={`toast-item toast-${toast.type} toast-enter ${toast.isExiting ? 'toast-exit' : ''}`}
              role="status"
            >
              <div className="toast-icon">{icon}</div>
              <div className="toast-content">{toast.message}</div>
              <button
                type="button"
                className="toast-close"
                onClick={() => handleDismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <CloseIcon />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
