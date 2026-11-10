/**
 * AuthorityVerificationGate.jsx - Passcode Gating Interceptor for Administrative Routes
 * Hashmat Uddin High School Online Admission System
 */

import { useState } from 'react';
import { Link } from 'react-router';
import { useAdminAuth } from '../../context/useAdminAuth';
import { useToast } from '../../context/useToast';
import { schoolConfig } from '../../config/schoolConfig';
import { SchoolShieldIcon, InfoIcon, ArrowLeftIcon } from '../../components/common/Icons';

export function AuthorityVerificationGate() {
  const { login } = useAdminAuth();
  const { showToast } = useToast();

  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the authority passcode.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await login(passcode);
      showToast('Authority authentication verified.', 'success');
    } catch (err) {
      setError(err.message || 'Incorrect authority passcode. Please check and try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      {/* Unverified Header */}
      <header className="authority-header">
        <div className="container authority-header-container">
          <div className="authority-brand">
            <span className="authority-badge">Restricted Access</span>
            <span className="authority-school">{schoolConfig.name}</span>
          </div>
          <div className="authority-actions">
            <Link to="/" className="btn btn-outline-light btn-sm">
              <ArrowLeftIcon /> Public Website
            </Link>
          </div>
        </div>
      </header>

      {/* Verification Card */}
      <div className="auth-verify-wrapper">
        <div className="auth-verify-card">
          <div className="verify-crest-box">
            <span className="verify-crest">
              <SchoolShieldIcon width={32} height={32} />
            </span>
          </div>
          <div className="verify-header text-center">
            <span className="badge badge-cancelled">CONFIDENTIAL &bull; RESTRICTED ACCESS</span>
            <h1 className="verify-title mt-2">Authority Verification</h1>
            <p className="verify-subtitle">
              Enter the administration passcode to access {schoolConfig.name}&apos;s authority portal.
            </p>
          </div>

          <form id="admin-verify-form" className="verify-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="admin-passcode-input" className="form-label">
                Authority Passcode
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  id="admin-passcode-input"
                  className="form-control"
                  placeholder="Enter administration passcode"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  required
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  id="btn-toggle-password"
                  className="btn-toggle-pass"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPass((prev) => !prev)}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              {error && (
                <div id="admin-passcode-error" className="form-error">
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              id="btn-verify-submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Verify Passcode & Enter Portal'}
            </button>

            <div className="verify-demo-hint">
              <span className="hint-icon">
                <InfoIcon />
              </span>
              <span>
                Demo Passcode: <code>admin2026</code>
              </span>
            </div>
          </form>

          <div className="verify-footer text-center">
            <Link to="/" className="link-muted">
              <ArrowLeftIcon /> Return to Public Student Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthorityVerificationGate;
