import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, getAuthHeaders } from '../context/CartContext';
import './NurseryPages.css';

function Checkout() {
  const { cart, totalPrice, clearCart, user, handleAuthError, showGlobalMessage } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    shippingAddress: user?.address || '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Protect checkout: block admin accounts and require authentication
  useEffect(() => {
    if (user && user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      navigate('/admin');
      return;
    }
    if (!user) {
      navigate('/login?redirect=/checkout&message=' + encodeURIComponent('Please log in to proceed to checkout.'));
      return;
    }
  }, [user, navigate, showGlobalMessage]);

  // Don't render checkout for unauthenticated or admin users
  if (!user || user.usertype === 'admin') {
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!user) {
      setError('Please login or register to place your order so you can track your purchase history.');
      return;
    }

    // Double-check: admin cannot place orders
    if (user.usertype === 'admin') {
      setError('This action is not available to administrator accounts.');
      return;
    }

    if (!formData.shippingAddress.trim()) {
      setError('Please provide a valid delivery address');
      return;
    }

    setLoading(true);

    try {
      // Map cart items for backend purchase payload
      const orderItems = cart.map((item) => ({
        plantId: item.plantId,
        plantName: item.plantName,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      const payload = {
        customerId: user.id || user._id,
        customerName: formData.name || user.name,
        customerEmail: formData.email || user.email,
        customerPhone: formData.phoneNumber || user.phoneNumber,
        shippingAddress: formData.shippingAddress,
        items: orderItems,
        // single-item properties for schema backward compatibility:
        plantId: orderItems[0]?.plantId,
        quantity: orderItems[0]?.quantity,
        price: orderItems[0]?.price,
        totalAmount: totalPrice
      };

      const res = await fetch('http://localhost:5000/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(user)
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // Handle session expiry
      if (res.status === 401) {
        handleAuthError(res);
        navigate('/login?redirect=/checkout&message=' + encodeURIComponent('Your session has expired. Please log in again.'));
        return;
      }

      // Handle forbidden (admin trying to purchase)
      if (res.status === 403) {
        setError(data.message || 'This action is not available to your account type.');
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order');
      }

      setOrderSuccess(data.purchase);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '700px' }}>
        <div style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>🎉</div>
        <span className="page-badge" style={{ background: '#dcfce7', color: '#166534' }}>Order Confirmed</span>
        <h1 className="page-title" style={{ marginTop: '0.5rem' }}>Thank You For Your Order!</h1>
        <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
          Your order has been recorded and our horticulturists are already preparing your plants fresh from the nursery!
        </p>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '2rem', textAlign: 'left', border: '1px solid #e7e5e4', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f4', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ color: '#78716c' }}>Order ID:</span>
            <span style={{ fontWeight: 700, color: '#166534' }}>#{orderSuccess._id.slice(-8).toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f4', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ color: '#78716c' }}>Payment Mode:</span>
            <span style={{ fontWeight: 600, color: '#854d0e' }}>Cash on Delivery (Offline)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f5f5f4', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ color: '#78716c' }}>Delivery To:</span>
            <span style={{ fontWeight: 600 }}>{orderSuccess.shippingAddress}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <span style={{ fontWeight: 700 }}>Total Payable:</span>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#166534' }}>₹{orderSuccess.totalAmount}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/orders')}>
            📦 View My Orders
          </button>
          <button className="btn-secondary" onClick={() => navigate('/plants')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <h2>Your Cart is Empty</h2>
        <p style={{ color: '#78716c', marginBottom: '1.5rem' }}>Please select some plants before proceeding to checkout.</p>
        <Link to="/plants" className="btn-primary">Browse Catalog</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <span className="page-badge">Direct From Greenhouse</span>
        <h1 className="page-title">Delivery Checkout</h1>
        <p className="page-subtitle">
          Confirm your delivery address and contact information. No online card or bank details required.
        </p>
      </div>

      {!user && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ color: '#92400e' }}>Sign in to complete your purchase:</strong>
            <p style={{ margin: '0.25rem 0 0', color: '#b45309', fontSize: '0.9rem' }}>
              Logging in connects this purchase to your customer order history so you can track delivery and leave reviews.
            </p>
          </div>
          <Link to="/login?redirect=/checkout" className="btn-primary" style={{ whiteSpace: 'nowrap', marginLeft: '1rem' }}>
            Sign In Now
          </Link>
        </div>
      )}

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="cart-layout">
        {/* Left: Customer Details Form */}
        <div className="cart-items-card">
          <h2 style={{ fontSize: '1.3rem', color: '#166534', marginBottom: '1.5rem' }}>
            1. Recipient & Shipping Information
          </h2>

          <div className="form-group">
            <label className="form-label" htmlFor="chk-name">Full Name *</label>
            <input
              id="chk-name"
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Priya Sharma"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="chk-email">Email Address *</label>
              <input
                id="chk-email"
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="priya@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="chk-phone">Contact Phone *</label>
              <input
                id="chk-phone"
                type="tel"
                name="phoneNumber"
                className="form-input"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="chk-address">Complete Delivery Address *</label>
            <textarea
              id="chk-address"
              name="shippingAddress"
              className="form-textarea"
              value={formData.shippingAddress}
              onChange={handleChange}
              placeholder="House/Flat number, Building name, Street, Landmark, City, State, Pincode"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="chk-notes">Special Care or Delivery Instructions (Optional)</label>
            <input
              id="chk-notes"
              type="text"
              name="notes"
              className="form-input"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Leave with security, call on arrival, etc."
            />
          </div>

          {/* Payment Method Notice */}
          <div style={{ marginTop: '2rem', borderTop: '1px solid #f5f5f4', paddingTop: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', color: '#166534', marginBottom: '1rem' }}>
              2. Payment Method
            </h2>

            <div style={{ border: '2px solid #16a34a', background: '#f0fdf4', borderRadius: '12px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input type="radio" id="cod" name="paymentMethod" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#166534' }} />
              <div>
                <label htmlFor="cod" style={{ fontWeight: 700, color: '#166534', cursor: 'pointer', fontSize: '1.05rem', display: 'block' }}>
                  💵 Cash on Delivery (COD) / Offline Payment
                </label>
                <p style={{ margin: '0.2rem 0 0', color: '#15803d', fontSize: '0.88rem' }}>
                  No online card or gateway required. Inspect your healthy plants first upon delivery and pay cash or UPI directly to the delivery person.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary Confirmation */}
        <div className="cart-summary-card">
          <h2 style={{ fontSize: '1.25rem', color: '#166534', marginBottom: '1.5rem', borderBottom: '1px solid #f5f5f4', paddingBottom: '0.75rem' }}>
            Selected Plants ({cart.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {cart.map((item) => (
              <div key={item.plantId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img src={item.image || '/images/plant-monstera.jpg'} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.plantName}</span>
                    <span style={{ color: '#78716c', marginLeft: '0.35rem' }}>× {item.quantity}</span>
                  </div>
                </div>
                <span style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span style={{ fontWeight: 600 }}>₹{totalPrice}</span>
          </div>

          <div className="summary-row">
            <span>Delivery & Packaging</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>
          </div>

          <div className="summary-row summary-total">
            <span>Payable on Delivery</span>
            <span>₹{totalPrice}</span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginTop: '1.5rem' }}
            disabled={loading}
          >
            {loading ? 'Confirming Order...' : '🌿 Place Order (Cash on Delivery)'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Checkout;
