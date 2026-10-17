import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './NurseryPages.css';

function PlantDetail() {
  const { id } = useParams();
  const [plant, setPlant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const { addToCart, user, showGlobalMessage } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPlant = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/plants/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Plant not found');
      }
      setPlant(data.plant);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddToCart = () => {
    if (user && user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      navigate('/admin');
      return;
    }
    if (!plant || plant.stock <= 0) return;
    addToCart(plant, quantity);
    showToast(`Added ${quantity} × ${plant.plantName} to your cart! 🌿`);
  };

  const handleBuyNow = () => {
    if (user && user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      navigate('/admin');
      return;
    }
    if (!plant || plant.stock <= 0) return;
    addToCart(plant, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <div style={{ fontSize: '1.3rem', color: '#166534' }}>Loading plant details... 🌱</div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '5rem 0' }}>
        <h2>Plant Not Found</h2>
        <p style={{ color: '#78716c', marginBottom: '2rem' }}>{error || "The plant you requested couldn't be loaded."}</p>
        <Link to="/plants" className="btn-primary">Browse All Plants</Link>
      </div>
    );
  }

  const isOutOfStock = plant.stock <= 0;

  return (
    <div className="page-wrapper">
      {toast && <div className="toast-msg">{toast}</div>}

      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/plants" style={{ color: '#166534', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Plants Collection
        </Link>
      </div>

      <div className="plant-detail-container">
        {/* Left: Plant Photo */}
        <div className="plant-detail-img-col">
          <img
            src={plant.image || '/images/plant-monstera.jpg'}
            alt={plant.plantName}
            className="plant-detail-main-img"
            onError={(e) => { e.target.src = '/images/plant-monstera.jpg'; }}
          />
          {plant.badge && (
            <span
              style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                background: '#166534',
                color: '#fff',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              {plant.badge}
            </span>
          )}
        </div>

        {/* Right: Plant Specs & Actions */}
        <div className="plant-detail-info-col">
          <div className="plant-detail-category">{plant.categoryName || 'General Nursery'}</div>
          <h1 className="plant-detail-title">{plant.plantName}</h1>
          {plant.botanicalName && (
            <div className="plant-detail-botanical">{plant.botanicalName}</div>
          )}

          <div className="plant-detail-price-box">
            <span className="plant-detail-price">₹{plant.price}</span>
            {plant.originalPrice && (
              <span className="plant-detail-original-price">₹{plant.originalPrice}</span>
            )}
            <span
              className={`stock-pill ${!isOutOfStock ? 'in-stock' : 'out-of-stock'}`}
              style={{ marginLeft: 'auto', fontSize: '0.9rem', padding: '0.35rem 0.8rem' }}
            >
              {!isOutOfStock ? `● ${plant.stock} In Stock` : '● Out of Stock'}
            </span>
          </div>

          <p className="plant-detail-desc">
            {plant.description ||
              'A gorgeous, vibrant plant hand-raised in our climate-controlled nursery. Guaranteed to arrive in peak health with custom protective eco-packaging and personalized care card.'}
          </p>

          {!isOutOfStock ? (
            <div className="plant-detail-actions">
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="qty-num">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity((q) => Math.min(plant.stock, q + 1))}
                  disabled={quantity >= plant.stock}
                >
                  +
                </button>
              </div>

              <button className="btn-primary" onClick={handleAddToCart}>
                🛒 Add to Cart
              </button>

              <button className="btn-terracotta" onClick={handleBuyNow}>
                ⚡ Buy Now
              </button>
            </div>
          ) : (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>
              This plant is currently out of stock. Please check back soon or browse our other varieties!
            </div>
          )}

          {/* Plant Care Highlights */}
          <div className="care-highlights">
            <div className="care-item">
              <div className="care-item-icon">☀️</div>
              <div className="care-item-title">Light</div>
              <div className="care-item-text">Bright indirect</div>
            </div>
            <div className="care-item">
              <div className="care-item-icon">💧</div>
              <div className="care-item-title">Water</div>
              <div className="care-item-text">When top 1" dries</div>
            </div>
            <div className="care-item">
              <div className="care-item-icon">📦</div>
              <div className="care-item-title">Packaging</div>
              <div className="care-item-text">99% safe arrival</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlantDetail;
