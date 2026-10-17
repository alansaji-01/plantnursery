import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, getAuthHeaders } from '../context/CartContext';
import './NurseryPages.css';

function Profile() {
  const { user, loginUser, handleAuthError } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile&message=' + encodeURIComponent('Please log in to view your profile.'));
      return;
    }
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const userId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/api/user/profile/${userId}`, {
        headers: getAuthHeaders(user)
      });

      if (res.status === 401) {
        handleAuthError(res);
        navigate('/login?redirect=/profile&message=' + encodeURIComponent('Your session has expired. Please log in again.'));
        return;
      }

      const data = await res.json();

      if (res.status === 403) {
        setError(data.message || 'You do not have permission to view this profile.');
        return;
      }

      if (data.success && data.user) {
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          phoneNumber: data.user.phoneNumber || '',
          address: data.user.address || ''
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setLoading(true);

    try {
      const userId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/api/user/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(user)
        },
        body: JSON.stringify(formData)
      });

      if (res.status === 401) {
        handleAuthError(res);
        navigate('/login?redirect=/profile&message=' + encodeURIComponent('Your session has expired. Please log in again.'));
        return;
      }

      const data = await res.json();

      if (res.status === 403) {
        setError(data.message || 'You do not have permission to modify this profile.');
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setMsg('Profile updated successfully! 🌿');
      // Update local storage user state
      loginUser({ ...user, ...formData });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page-wrapper">
      <div className="auth-container" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <div className="auth-icon">👤</div>
          <h1 className="auth-title">My Account Profile</h1>
          <p className="auth-subtitle">Update your personal details and default shipping address</p>
        </div>

        {msg && <div style={{ color: '#15803d', background: '#dcfce7', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>{msg}</div>}
        {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="prof-username">Username (Non-editable)</label>
            <input
              id="prof-username"
              type="text"
              className="form-input"
              value={user?.username || ''}
              disabled
              style={{ background: '#f5f5f4', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-name">Full Name *</label>
            <input
              id="prof-name"
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-email">Email Address *</label>
            <input
              id="prof-email"
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-phone">Phone Number</label>
            <input
              id="prof-phone"
              type="tel"
              name="phoneNumber"
              className="form-input"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="prof-address">Default Delivery Address</label>
            <textarea
              id="prof-address"
              name="address"
              className="form-textarea"
              value={formData.address}
              onChange={handleChange}
              placeholder="House, street, city, pincode"
              rows={3}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
