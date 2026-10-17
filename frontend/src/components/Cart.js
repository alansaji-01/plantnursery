import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './NurseryPages.css';

function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice, totalItemsCount, user, showGlobalMessage } = useCart();
  const navigate = useNavigate();

  // Block admin users from accessing the cart
  useEffect(() => {
    if (user && user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      navigate('/admin');
    }
  }, [user, navigate, showGlobalMessage]);

  // Don't render cart content for admin users (prevent flash before redirect)
  if (user && user.usertype === 'admin') {
    return null;
  }

  if (cart.length === 0) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🪴</div>
        <h1 className="page-title" style={{ fontSize: '2rem' }}>Your Plant Cart is Empty</h1>
        <p className="page-subtitle" style={{ marginBottom: '2rem' }}>
          Looks like you haven't added any green companions to your cart yet. Explore our nursery collection to find your next favorite plant!
        </p>
        <Link to="/plants" className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
          Explore Plants →
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <span className="page-badge">Your Botanical Selection</span>
        <h1 className="page-title">Shopping Cart</h1>
        <p className="page-subtitle">
          Review your selected plants before proceeding to delivery checkout.
        </p>
      </div>

      <div className="cart-layout">
        {/* Left: Items List */}
        <div className="cart-items-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f5f5f4', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#166534', margin: 0 }}>
              Plants in Cart ({totalItemsCount})
            </h2>
            <button
              onClick={clearCart}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Clear Cart
            </button>
          </div>

          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.plantId} className="cart-item-row">
                <img src={item.image || '/images/plant-monstera.jpg'} alt={item.plantName} className="cart-item-img" />

                <div className="cart-item-details">
                  <Link to={`/plants/${item.plantId}`} className="cart-item-title">
                    {item.plantName}
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: '#78716c', marginTop: '0.15rem' }}>
                    {item.categoryName}
                  </div>
                  <div className="cart-item-price">
                    ₹{item.price} each
                  </div>
                </div>

                {/* Qty controls */}
                <div className="qty-control" style={{ transform: 'scale(0.9)' }}>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.plantId, item.quantity - 1)}
                  >
                    -
                  </button>
                  <span className="qty-num">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.plantId, item.quantity + 1)}
                    disabled={item.quantity >= (item.stock || 99)}
                  >
                    +
                  </button>
                </div>

                <div style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '80px', textAlign: 'right', color: '#166534' }}>
                  ₹{item.price * item.quantity}
                </div>

                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.plantId)}
                  title="Remove from cart"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Link to="/plants" className="btn-secondary">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="cart-summary-card">
          <h2 style={{ fontSize: '1.25rem', color: '#166534', marginBottom: '1.5rem', borderBottom: '1px solid #f5f5f4', paddingBottom: '0.75rem' }}>
            Order Summary
          </h2>

          <div className="summary-row">
            <span>Subtotal ({totalItemsCount} items)</span>
            <span style={{ fontWeight: 600 }}>₹{totalPrice}</span>
          </div>

          <div className="summary-row">
            <span>Greenhouse Safe Packaging</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>
          </div>

          <div className="summary-row">
            <span>Nursery Delivery</span>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>FREE</span>
          </div>

          <div className="summary-row summary-total">
            <span>Total Amount</span>
            <span>₹{totalPrice}</span>
          </div>

          {/* Offline Payment guarantee banner */}
          <div className="cod-banner">
            <span className="cod-banner-icon">🚚</span>
            <div>
              <div className="cod-banner-title">Cash on Delivery Available</div>
              <div className="cod-banner-desc">
                No online payment required now. Inspect your plants upon arrival and pay comfortably at your doorstep.
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
            onClick={() => navigate('/checkout')}
          >
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
