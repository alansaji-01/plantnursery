import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './NurseryPages.css';

function ForgotPassword() {
  const { user, showGlobalMessage } = useCart();
  const navigate = useNavigate();

  // Redirect admin users immediately — password recovery is for customers only
  useEffect(() => {
    if (user && user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      navigate('/admin');
    }
  }, [user, navigate, showGlobalMessage]);

  const [step, setStep] = useState(1); // 1: identify, 2: verify email & set new password, 3: success
  const [identifier, setIdentifier] = useState('');
  const [verifiedAccount, setVerifiedAccount] = useState(null);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (user && user.usertype === 'admin') {
    return null;
  }

  // STEP 1: Verify customer account
  const handleVerifyAccount = async (e) => {
    e.preventDefault();
    setError('');
    const cleanId = identifier.trim();

    if (!cleanId) {
      setError('Please enter your username or registered email address.');
      return;
    }

    // Client-side block for admin
    if (cleanId.toLowerCase() === 'admin' || cleanId.toLowerCase() === 'admin@bloomora.com') {
      setError('This action is not available to administrator accounts.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Verification failed');
      }

      setVerifiedAccount(data);
      // Pre-fill confirmEmail if user typed a valid email in Step 1
      if (cleanId.includes('@')) {
        setConfirmEmail(cleanId);
      }
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Submit password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Extra client-side block for admin
    if (identifier.trim().toLowerCase() === 'admin' || confirmEmail.trim().toLowerCase() === 'admin@bloomora.com') {
      setError('This action is not available to administrator accounts.');
      return;
    }

    if (!confirmEmail.trim()) {
      setError('Please confirm your registered email address.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          email: confirmEmail.trim(),
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to reset password');
      }

      setSuccessMsg(data.message);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="auth-container" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <div className="auth-icon">🔑</div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            {step === 1 && 'Recover access to your customer plant nursery account'}
            {step === 2 && 'Verify your identity and choose a secure new password'}
            {step === 3 && 'Password successfully updated'}
          </p>
        </div>

        {error && (
          <div
            style={{
              color: '#dc2626',
              background: '#fee2e2',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.25rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              textAlign: 'left',
              border: '1px solid #fecaca'
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* STEP 1: IDENTIFY ACCOUNT */}
        {step === 1 && (
          <form onSubmit={handleVerifyAccount}>
            <div className="form-group">
              <label className="form-label" htmlFor="fp-identifier">
                Customer Username or Registered Email
              </label>
              <input
                id="fp-identifier"
                type="text"
                className="form-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. priya or priya@example.com"
                required
                autoFocus
              />
              <span style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '0.25rem', display: 'block' }}>
                Note: Password recovery is available exclusively for customer accounts.
              </span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
            >
              {loading ? 'Checking Account...' : 'Continue →'}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY EMAIL & CHOOSE NEW PASSWORD */}
        {step === 2 && verifiedAccount && (
          <form onSubmit={handleResetPassword}>
            <div
              style={{
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
                Customer Account Found
              </div>
              <div style={{ color: '#14532d', fontWeight: 600, fontSize: '0.95rem' }}>
                {verifiedAccount.name} (@{verifiedAccount.username})
              </div>
              <div style={{ color: '#15803d', fontSize: '0.85rem' }}>
                Linked Email: <code>{verifiedAccount.maskedEmail}</code>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fp-confirm-email">
                Confirm Full Registered Email Address *
              </label>
              <input
                id="fp-confirm-email"
                type="email"
                className="form-input"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Enter your complete email for verification"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fp-new-password">
                New Password (minimum 6 characters) *
              </label>
              <input
                id="fp-new-password"
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="fp-confirm-password">
                Confirm New Password *
              </label>
              <input
                id="fp-confirm-password"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 2 }}
                disabled={loading}
              >
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🎉</div>
            <div
              style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '1rem',
                borderRadius: '8px',
                fontWeight: 600,
                marginBottom: '1.5rem',
                border: '1px solid #bbf7d0'
              }}
            >
              {successMsg || 'Your password has been successfully reset!'}
            </div>
            <p style={{ color: '#78716c', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              You can now sign in to your Bloomora account using your new password.
            </p>
            <Link to="/login" className="btn-primary" style={{ width: '100%' }}>
              Proceed to Sign In →
            </Link>
          </div>
        )}

        {/* FOOTER NAVIGATION */}
        <div className="auth-switch" style={{ borderTop: '1px solid #f5f5f4', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
          <Link to="/login" style={{ color: '#166534', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
          <span style={{ margin: '0 0.5rem', color: '#d6d3d1' }}>•</span>
          <Link to="/register" style={{ color: '#166534', fontWeight: 600, textDecoration: 'none' }}>
            Create New Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
