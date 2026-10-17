import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './NurseryPages.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser, globalMessage, clearGlobalMessage } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get('redirect') || null;
  const infoMessage = searchParams.get('message') || '';

  // Show global message (e.g. session expired) on mount, then clear it
  useEffect(() => {
    if (globalMessage) {
      setError(globalMessage);
      clearGlobalMessage();
    }
  }, [globalMessage, clearGlobalMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      loginUser(data.user);

      if (data.user.usertype === 'admin') {
        // Admin always goes to admin dashboard, ignore customer-only redirects
        navigate('/admin');
      } else if (redirectTo) {
        // Prevent redirect loops — don't redirect back to login/register
        const safeRedirect = redirectTo.startsWith('/login') || redirectTo.startsWith('/register')
          ? '/'
          : redirectTo;
        navigate(safeRedirect);
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-icon">🌿</div>
          <h1 className="auth-title">Welcome to Bloomora</h1>
          <p className="auth-subtitle">Sign in to your customer or admin account</p>
        </div>

        {/* <div className="admin-demo-hint">
          <strong>Default Admin Demo:</strong><br />
          Username: <code>admin</code> &nbsp;|&nbsp; Password: <code>admin123</code>
        </div> */}

        {/* Info message from redirect (e.g. "Please log in to access this page") */}
        {infoMessage && !error && (
          <div style={{ color: '#92400e', background: '#fef3c7', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 600 }}>
            {decodeURIComponent(infoMessage)}
          </div>
        )}

        {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username or Email</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin or priya or priya@example.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
              <Link
                to="/forgot-password"
                style={{
                  color: '#166534',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          Don't have an account? <Link to="/register">Create customer account</Link>
          <div style={{ marginTop: '0.5rem' }}>
            <Link to="/forgot-password" style={{ color: '#78716c', fontSize: '0.85rem' }}>
              Forgot password? Recover account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
