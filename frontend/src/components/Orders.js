import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, getAuthHeaders } from '../context/CartContext';
import './NurseryPages.css';

function Orders() {
  const { user, handleAuthError, showGlobalMessage } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/orders&message=' + encodeURIComponent('Please log in to view your orders.'));
      return;
    }
    // Admin should not access customer orders page
    if (user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      navigate('/admin');
      return;
    }
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, showGlobalMessage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const customerId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/api/purchases/my-orders/${customerId}`, {
        headers: getAuthHeaders(user)
      });

      // Handle session expiry
      if (res.status === 401) {
        handleAuthError(res);
        navigate('/login?redirect=/orders&message=' + encodeURIComponent('Your session has expired. Please log in again.'));
        return;
      }

      const data = await res.json();

      if (res.status === 403) {
        setError(data.message || 'You do not have permission to view these orders.');
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect handled in useEffect — don't render content for unauthenticated or admin
  if (!user || user.usertype === 'admin') {
    return null;
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <span className="page-badge">Customer Account</span>
        <h1 className="page-title">My Nursery Orders</h1>
        <p className="page-subtitle">
          Track your past purchases, delivered plants, and delivery receipts.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#166534', fontSize: '1.2rem' }}>
          Loading your orders... 🌿
        </div>
      ) : error ? (
        <div style={{ color: '#dc2626', background: '#fee2e2', padding: '1rem', borderRadius: '8px' }}>{error}</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e7e5e4' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
          <h2 style={{ color: '#44403c', marginBottom: '0.5rem' }}>No Orders Yet</h2>
          <p style={{ color: '#78716c', marginBottom: '1.5rem' }}>
            You haven't purchased any plants from Bloomora yet.
          </p>
          <Link to="/plants" className="btn-primary">Browse Plant Catalog</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const dateStr = new Date(order.purchaseDate || order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div>
                    <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                    <div style={{ fontSize: '0.85rem', color: '#78716c', marginTop: '0.2rem' }}>
                      Placed on {dateStr}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="order-status-badge">● {order.status || 'Confirmed'}</span>
                    <span style={{ fontSize: '0.85rem', color: '#854d0e', background: '#fef9c3', padding: '0.3rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>
                      {order.paymentMethod || 'Cash on Delivery'}
                    </span>
                  </div>
                </div>

                {/* Items in order */}
                <div className="order-items-grid">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((it, idx) => (
                      <div key={idx} className="order-item-inline">
                        <img
                          src={it.image || '/images/plant-monstera.jpg'}
                          alt={it.plantName}
                          className="order-item-thumb"
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{it.plantName}</div>
                          <div style={{ fontSize: '0.85rem', color: '#78716c' }}>
                            Qty: {it.quantity} &nbsp;|&nbsp; ₹{it.price} each
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, color: '#166534' }}>
                          ₹{it.price * it.quantity}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="order-item-inline">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>Plant Purchase</div>
                        <div style={{ fontSize: '0.85rem', color: '#78716c' }}>Qty: {order.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#166534' }}>
                        ₹{order.totalAmount}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer of order card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f4', paddingTop: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ fontSize: '0.88rem', color: '#57534e' }}>
                    <strong>Shipping Address:</strong> {order.shippingAddress}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>
                    Total: ₹{order.totalAmount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Orders;
