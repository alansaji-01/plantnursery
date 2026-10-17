import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './NurseryPages.css';

export function AboutUs() {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <span className="page-badge">Our Journey</span>
        <h1 className="page-title">Rooted In Love For Greenery</h1>
        <p className="page-subtitle">
          From a humble greenhouse to delivering over 50,000+ healthy plants straight to doorsteps across India.
        </p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '20px', padding: '3rem', border: '1px solid #e7e5e4', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', color: '#166534', marginBottom: '1rem' }}>
              Nurturing Homes, Purifying Air
            </h2>
            <p style={{ lineHeight: '1.8', color: '#57534e', marginBottom: '1.25rem' }}>
              Founded with the vision to make plant parenthood effortless, accessible, and joyful, Bloomora nurtures every plant in optimal climate-controlled greenhouse environments before dispatch.
            </p>
            <p style={{ lineHeight: '1.8', color: '#57534e', marginBottom: '1.5rem' }}>
              We believe a home filled with living plants is calmer, cleaner, and happier. Every plant is checked by trained botanists and potted in aerated, organic, pest-free potting soil.
            </p>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <strong style={{ fontSize: '1.8rem', color: '#166534', display: 'block' }}>100%</strong>
                <span style={{ fontSize: '0.9rem', color: '#78716c' }}>Greenhouse Raised</span>
              </div>
              <div>
                <strong style={{ fontSize: '1.8rem', color: '#166534', display: 'block' }}>99%</strong>
                <span style={{ fontSize: '0.9rem', color: '#78716c' }}>Safe Transit Guarantee</span>
              </div>
              <div>
                <strong style={{ fontSize: '1.8rem', color: '#166534', display: 'block' }}>50K+</strong>
                <span style={{ fontSize: '0.9rem', color: '#78716c' }}>Plant Parents</span>
              </div>
            </div>
          </div>
          <div>
            <img
              src="/images/hero-nursery.jpg"
              alt="Bloomora Greenhouse"
              style={{ width: '100%', height: '380px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            />
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Link to="/plants" className="btn-primary" style={{ padding: '0.9rem 2.2rem' }}>
          Explore Our Collection →
        </Link>
      </div>
    </div>
  );
}

export function ContactUs() {
  const { user, showGlobalMessage } = useCart();
  const navigate = useNavigate();

  // Redirect admin users immediately — Contact Us is a customer-facing inquiry page
  useEffect(() => {
    if (user && user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      navigate('/admin');
    }
  }, [user, navigate, showGlobalMessage]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  // Pre-fill fields if user logs in while on this page
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  if (user && user.usertype === 'admin') {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.message.trim()) {
      setError('Please enter your message.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || 'General Inquiry',
        message: formData.message.trim(),
        customerId: user?.id || user?._id || null
      };

      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit contact message. Please try again.');
      }

      setSubmitted(true);
      setSuccessMsg(data.message || 'Thank you for reaching out! A nursery plant expert will reply within 24 hours.');
      // Reset form
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <span className="page-badge">Get In Touch</span>
        <h1 className="page-title">We'd Love To Hear From You</h1>
        <p className="page-subtitle">
          Have questions about plant care, order status, or nursery recommendations? Our botanical team is here to help.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', background: '#ffffff', borderRadius: '20px', padding: '3rem', border: '1px solid #e7e5e4', boxShadow: '0 4px 25px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#166534', marginBottom: '1.5rem' }}>
            Nursery Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>📍</span>
              <div>
                <strong>Bloomora Greenhouses</strong>
                <p style={{ margin: '0.2rem 0 0', color: '#78716c', fontSize: '0.95rem' }}>
                  Plot 14, Gardenia Botanical Corridor, Green Valley, India
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>📞</span>
              <div>
                <strong>Customer Support Phone</strong>
                <p style={{ margin: '0.2rem 0 0', color: '#78716c', fontSize: '0.95rem' }}>
                  +91 (080) 4567-8900 / +91 98765 43210
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>✉️</span>
              <div>
                <strong>Email Address</strong>
                <p style={{ margin: '0.2rem 0 0', color: '#78716c', fontSize: '0.95rem' }}>
                  support@bloomora.com / plantdoctor@bloomora.com
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>⏰</span>
              <div>
                <strong>Nursery Hours</strong>
                <p style={{ margin: '0.2rem 0 0', color: '#78716c', fontSize: '0.95rem' }}>
                  Monday – Sunday: 8:00 AM – 7:30 PM IST
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: '#166534', marginBottom: '1.5rem' }}>
            Send Us A Message
          </h2>

          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.9rem 1.2rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.92rem', fontWeight: 500, border: '1px solid #fecaca' }}>
              ⚠️ {error}
            </div>
          )}

          {submitted ? (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '2rem', borderRadius: '16px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌿</div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', color: '#166534' }}>Message Received!</h3>
              <p style={{ margin: '0 0 1.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {successMsg}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="btn-outline"
                style={{ padding: '0.6rem 1.4rem', fontSize: '0.9rem' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="ct-name">Your Name *</label>
                <input
                  id="ct-name"
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ct-email">Email Address *</label>
                <input
                  id="ct-email"
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. priya@example.com"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ct-subject">Subject</label>
                <input
                  id="ct-subject"
                  type="text"
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Care advice for Monstera or Order Inquiry"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="ct-msg">Message *</label>
                <textarea
                  id="ct-msg"
                  className="form-textarea"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us what plants or care guidance you are looking for..."
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Sending Message... 🌿' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
