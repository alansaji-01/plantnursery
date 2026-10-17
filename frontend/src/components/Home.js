import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, getAuthHeaders } from '../context/CartContext';
import './Home.css';
import './NurseryPages.css';

function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const observerRef = useRef(null);
  const navigate = useNavigate();
  const { addToCart, totalItemsCount, user, logoutUser, globalMessage, clearGlobalMessage, showGlobalMessage } = useCart();

  // Dynamic data states
  const [livePlants, setLivePlants] = useState([]);
  const [liveCategories, setLiveCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [toast, setToast] = useState('');
  const [loadingPlants, setLoadingPlants] = useState(true);

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedPlantName, setSelectedPlantName] = useState('Bloomora Plants');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Scroll-based navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch live plants, categories, and reviews
  useEffect(() => {
    fetchHomepageData();
  }, []);

  // Ensure all dynamically rendered elements are immediately visible
  useEffect(() => {
    const els = document.querySelectorAll('.fade-in-up');
    els.forEach((el) => {
      el.classList.add('visible');
    });
  }, [livePlants, reviews]);

  // Display incoming global message (e.g. "Access denied. Administrator privileges are required.")
  useEffect(() => {
    if (globalMessage) {
      setToast(globalMessage);
      clearGlobalMessage();
    }
  }, [globalMessage, clearGlobalMessage]);

  // Check customer purchase eligibility for reviews
  useEffect(() => {
    if (user && user.usertype === 'customer') {
      const custId = user.id || user._id;
      fetch(`http://localhost:5000/api/reviews/check-purchased/${custId}`, {
        headers: getAuthHeaders(user)
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setHasPurchased(data.hasPurchased);
        })
        .catch((e) => console.error(e));
    }
  }, [user]);

  const fetchHomepageData = async () => {
    try {
      const [plantsRes, catsRes, reviewsRes] = await Promise.all([
        fetch('http://localhost:5000/api/plants'),
        fetch('http://localhost:5000/api/categories'),
        fetch('http://localhost:5000/api/reviews')
      ]);

      const pData = await plantsRes.json();
      const cData = await catsRes.json();
      const rData = await reviewsRes.json();

      if (pData.success) setLivePlants(pData.plants);
      if (cData.success) setLiveCategories(cData.categories);
      if (rData.success) setReviews(rData.reviews);
    } catch (err) {
      console.error('Failed to load live data:', err);
    } finally {
      setLoadingPlants(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddToCart = (e, plant) => {
    e.preventDefault();
    e.stopPropagation();
    if (user && user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      navigate('/admin');
      return;
    }
    if (plant.stock <= 0) return;
    addToCart(plant, 1);
    showToast(`Added "${plant.plantName}" to your cart! 🌿`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=/&message=' + encodeURIComponent('Please log in to submit a review.'));
      return;
    }
    if (user.usertype === 'admin') {
      alert('This action is not available to administrator accounts.');
      return;
    }
    if (!reviewText.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(user)
        },
        body: JSON.stringify({
          customerId: user.id || user._id,
          customerName: user.name || user.username,
          customerLocation: user.address ? user.address.split(',').slice(-1)[0].trim() : 'Customer',
          rating,
          reviewText,
          plantName: selectedPlantName
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Submission failed');

      showToast('Thank you for your review! 🌸');
      setReviewText('');
      setShowReviewForm(false);
      fetchHomepageData();
    } catch (err) {
      alert(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(user)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to delete');

      showToast('Review removed.');
      fetchHomepageData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Intersection Observer for scroll-triggered fade-in animations
  const animateOnScroll = useCallback((node) => {
    if (!node) return;
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
    }
    const els = node.querySelectorAll('.fade-in-up');
    els.forEach((el) => observerRef.current.observe(el));
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  // Display top 6 featured plants on homepage
  const featuredPlants = livePlants.slice(0, 6);

  return (
    <div className="nursery-home" ref={animateOnScroll}>
      {toast && <div className="toast-msg">{toast}</div>}

      {/* ===== NAVBAR ===== */}
      <nav className={`nursery-nav ${scrolled ? 'scrolled' : ''}`} id="main-nav">
        <Link to="/" className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="nav-logo-icon">🌿</span>
          <span className="nav-logo-text">Bloomora</span>
        </Link>

        <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <li><Link to="/plants" onClick={() => setMobileMenuOpen(false)}>Shop Plants</Link></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }}>Why Us</a></li>
          <li><Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Us</Link></li>
          <li><a href="#reviews" onClick={(e) => { e.preventDefault(); scrollToSection('reviews'); }}>Reviews</a></li>
          <li><Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>

          {/* Cart with count badge */}
          <li>
            <Link to="/cart" className="nav-cart-link" onClick={() => setMobileMenuOpen(false)}>
              🛒 Cart
              {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
            </Link>
          </li>

          {/* Auth / Admin */}
          {user ? (
            <>
              {user.usertype === 'admin' ? (
                <li>
                  <Link to="/admin" className="nav-admin-badge" onClick={() => setMobileMenuOpen(false)}>
                    🛡️ Admin Panel
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>
                      📦 My Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                      👤 Profile
                    </Link>
                  </li>
                </>
              )}
              <li className="user-welcome">
                <span className="user-greeting">Hi, {user.name ? user.name.split(' ')[0] : user.username}</span>
                <button onClick={logoutUser} className="btn-logout" title="Log out">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-auth-buttons">
              <Link to="/login" className="btn-nav-login" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn-nav-register" onClick={() => setMobileMenuOpen(false)}>
                Register
              </Link>
            </li>
          )}
        </ul>

        <button
          className="nav-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          id="mobile-menu-toggle"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* ===== HERO ===== */}
      <section className="hero-section" id="top">
        <div className="hero-bg">
          <img src="/images/hero-nursery.jpg" alt="Lush greenhouse nursery interior" />
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Hand-Curated Nursery Plants Delivered Across India
          </div>
          <h1 className="hero-title">
            Bring Nature <em>Home</em>
          </h1>
          <p className="hero-subtitle">
            Discover our greenhouse collection of air purifiers, indoor trees, succulents, and flowering botanicals.
            Shipped safe and fresh directly to your doorstep with Cash on Delivery.
          </p>
          <div className="hero-actions">
            <Link to="/plants" className="btn btn-primary">
              Explore All Plants →
            </Link>
            <Link to="/about" className="btn btn-outline">
              Our Story
            </Link>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ===== CATEGORIES STRIP ===== */}
      <div className="categories-strip">
        <div className="categories-container">
          {liveCategories.map((cat) => (
            <Link
              key={cat._id}
              className="category-item"
              to={`/plants?category=${encodeURIComponent(cat.name)}`}
            >
              <div className="category-icon">{cat.icon || '🌱'}</div>
              <span className="category-name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section className="section features-section" id="features">
        <div className="section-header fade-in-up">
          <div className="section-label">Why Choose Us</div>
          <h2 className="section-title">Rooted in Quality, Grown with Care</h2>
          <p className="section-subtitle">
            Every plant in our nursery is nurtured by experts and shipped with love.
            We guarantee healthy, vibrant plants that thrive in your space.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card fade-in-up">
            <div className="feature-icon green">🌱</div>
            <h3 className="feature-title">Exquisite Nursery Varieties</h3>
            <p className="feature-desc">
              From air-purifying Dracaenas to architectural Fiddle Leaf Figs and rare succulents. Hand-nurtured in organic soil.
            </p>
          </div>
          <div className="feature-card fade-in-up">
            <div className="feature-icon terracotta">📦</div>
            <h3 className="feature-title">Safe Custom Packaging</h3>
            <p className="feature-desc">
              Custom-designed eco-friendly packaging keeps your plants secure during transit.
              Our survival rate is 99.2% — industry leading.
            </p>
          </div>
          <div className="feature-card fade-in-up">
            <div className="feature-icon sand">💵</div>
            <h3 className="feature-title">Cash on Delivery</h3>
            <p className="feature-desc">
              Inspect your plants fresh at arrival with zero stress. Convenient offline cash or UPI payment at your doorstep.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PLANT CATALOG (Live from MongoDB API) ===== */}
      <section className="section catalog-section" id="catalog">
        <div className="section-header fade-in-up">
          <div className="section-label">Our Collection</div>
          <h2 className="section-title">Featured Greenhouse Favorites</h2>
          <p className="section-subtitle">
            Hand-picked varieties that purify your air, elevate your décor,
            and bring botanical tranquility to any room.
          </p>
        </div>

        {loadingPlants ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 0', color: '#166534', fontSize: '1.15rem', fontWeight: 600 }}>
            🌿 Loading lush plants fresh from the nursery...
          </div>
        ) : (
          <div className="catalog-grid">
            {featuredPlants.map((plant) => (
              <div key={plant._id} className="plant-card fade-in-up visible">
                <Link to={`/plants/${plant._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="plant-card-img">
                    <img
                      src={plant.image || '/images/plant-monstera.jpg'}
                      alt={plant.plantName}
                      onError={(e) => { e.target.src = '/images/plant-monstera.jpg'; }}
                    />
                    {plant.badge && (
                      <span className="plant-badge new">{plant.badge}</span>
                    )}
                    {plant.stock <= 0 && (
                      <span className="plant-badge sale" style={{ background: '#dc2626' }}>Sold Out</span>
                    )}
                  </div>
                  <div className="plant-card-info">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="plant-category">{plant.categoryName || 'General'}</div>
                      <span className={`stock-pill ${plant.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {plant.stock > 0 ? `${plant.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <div className="plant-name">{plant.plantName}</div>
                    <div className="plant-botanical">{plant.botanicalName}</div>
                    <div className="plant-price-row">
                      <span className="plant-price">
                        ₹{plant.price}
                        {plant.originalPrice && <span className="original">₹{plant.originalPrice}</span>}
                      </span>
                      <button
                        className="plant-add-btn"
                        onClick={(e) => handleAddToCart(e, plant)}
                        disabled={plant.stock <= 0}
                        aria-label="Add to cart"
                        title={plant.stock > 0 ? 'Add to cart' : 'Out of stock'}
                        style={plant.stock <= 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="view-all-container fade-in-up" style={{ marginTop: '2.5rem' }}>
          <Link to="/plants" className="btn btn-dark">
            Explore Full Plant Collection →
          </Link>
        </div>
      </section>

      {/* ===== OUR STORY ===== */}
      <section className="section story-section" id="story">
        <div className="story-container">
          <div className="story-content fade-in-up">
            <div className="story-label">Our Story</div>
            <h2 className="story-title">
              From a Small Greenhouse to India's Most <em>Loved</em> Online Nursery
            </h2>
            <p className="story-text">
              What started as a family passion project in 2018 has grown into a thriving
              community of 50,000+ plant parents across India. We believe every home
              deserves the calming beauty of living greenery — and we're on a mission
              to make plant parenthood accessible, joyful, and sustainable.
            </p>
            <p className="story-text">
              Our expert horticulturists personally nurture each plant in our climate-controlled
              greenhouses before carefully packaging and shipping them to your doorstep.
            </p>

            <div className="story-stats">
              <div className="stat-item">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Greenhouse Grown</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99%</span>
                <span className="stat-label">Survival Rate</span>
              </div>
            </div>
          </div>

          <div className="story-image-grid fade-in-up">
            <div className="story-img">
              <img src="/images/plant-monstera.jpg" alt="Monstera plant in nursery" />
            </div>
            <div className="story-img">
              <img src="/images/plant-fiddle.jpg" alt="Fiddle leaf fig plant" />
            </div>
            <div className="story-img">
              <img src="/images/plant-snake.jpg" alt="Snake plant collection" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== CARE TIPS ===== */}
      <section className="section tips-section" id="tips">
        <div className="section-header fade-in-up">
          <div className="section-label">Plant Care 101</div>
          <h2 className="section-title">Help Your Plants Thrive</h2>
          <p className="section-subtitle">
            Simple tips from our horticulturists to keep your green companions happy and healthy.
          </p>
        </div>

        <div className="tips-grid">
          {[
            { emoji: '☀️', title: 'Right Light', desc: 'Most indoor plants thrive in bright, indirect light. Avoid harsh afternoon sun that can scorch leaves.' },
            { emoji: '💧', title: 'Smart Watering', desc: 'Let the top inch of soil dry out between watering. Overwatering is the #1 cause of houseplant problems.' },
            { emoji: '🌡️', title: 'Temperature', desc: 'Keep your plants away from cold drafts and AC vents. Most tropicals prefer 18-27°C.' },
            { emoji: '🪴', title: 'Repotting', desc: 'Repot every 12-18 months or when roots start circling. Go up only 1 pot size at a time.' },
          ].map((tip, i) => (
            <div key={i} className="tip-card fade-in-up">
              <span className="tip-emoji">{tip.emoji}</span>
              <h3 className="tip-title">{tip.title}</h3>
              <p className="tip-desc">{tip.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOMEPAGE CUSTOMER REVIEWS (Interactive & Manageable) ===== */}
      <section className="section testimonials-section" id="reviews">
        <div className="section-header fade-in-up">
          <div className="section-label">Verified Customer Reviews</div>
          <h2 className="section-title">Loved by Plant Parents Across India</h2>
          <p className="section-subtitle">
            Read real feedback from verified customers who bought plants from our greenhouse.
          </p>
        </div>

        {/* Reviews Action Bar */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {user ? (
            hasPurchased ? (
              <button
                className="btn-primary"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? '✕ Close Review Form' : '✍️ Write A Plant Review'}
              </button>
            ) : (
              <div style={{ fontSize: '0.9rem', color: '#78716c', background: '#f5f5f4', display: 'inline-block', padding: '0.6rem 1.25rem', borderRadius: '9999px' }}>
                💡 Place an order with Bloomora to share your plant review and rating!
              </div>
            )
          ) : (
            <Link to="/login" className="btn-secondary">
              Sign In to Submit a Review
            </Link>
          )}
        </div>

        {/* Customer Review Submission Form */}
        {showReviewForm && (
          <div className="review-form-card" style={{ maxWidth: '650px', margin: '0 auto 3rem' }}>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#166534', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Share Your Nursery Experience
            </h3>
            <p style={{ color: '#78716c', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Your rating helps other plant lovers choose the best varieties.
            </p>

            <form onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Plant Variety Reviewed</label>
                <select
                  className="form-select"
                  value={selectedPlantName}
                  onChange={(e) => setSelectedPlantName(e.target.value)}
                >
                  <option value="Bloomora Nursery Experience">Bloomora Nursery Overall</option>
                  {livePlants.slice(0, 30).map((p) => (
                    <option key={p._id} value={p.plantName}>
                      {p.plantName} ({p.categoryName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Rating (1 to 5 Stars)</label>
                <div className="star-rating-select">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star-btn ${rating >= star ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                  <span style={{ alignSelf: 'center', fontWeight: 700, color: '#f59e0b', marginLeft: '0.5rem' }}>
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rev-text">Your Review *</label>
                <textarea
                  id="rev-text"
                  className="form-textarea"
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="How did your plant arrive? How is it thriving in your home?"
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Posting Review...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {/* Reviews Grid */}
        <div className="testimonials-grid">
          {reviews.map((rev) => {
            const isOwner = user && (user.id === rev.customerId || user._id === rev.customerId);
            const starsStr = '★'.repeat(rev.rating) + '☆'.repeat(Math.max(0, 5 - rev.rating));
            const initials = rev.customerName
              ? rev.customerName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'NB';

            return (
              <div key={rev._id} className="testimonial-card fade-in-up" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div className="testimonial-stars" style={{ color: '#f59e0b', fontSize: '1.2rem' }}>
                    {starsStr}
                  </div>
                  {rev.plantName && (
                    <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#166534', padding: '0.2rem 0.55rem', borderRadius: '9999px', fontWeight: 600 }}>
                      🌿 {rev.plantName}
                    </span>
                  )}
                </div>

                <p className="testimonial-text">"{rev.reviewText}"</p>

                <div className="testimonial-author">
                  <div className="testimonial-avatar">{initials}</div>
                  <div>
                    <div className="testimonial-name">{rev.customerName}</div>
                    <div className="testimonial-role">{rev.customerLocation || 'Verified Buyer'}</div>
                  </div>
                </div>

                {/* Manage / Delete button for customer's own review */}
                {isOwner && (
                  <button
                    onClick={() => handleDeleteReview(rev._id)}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                    title="Delete your review"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== NEWSLETTER CTA ===== */}
      <section className="section cta-section" id="contact">
        <div className="cta-container fade-in-up">
          <h2 className="cta-title">Join the Bloomora Community</h2>
          <p className="cta-text">
            Get exclusive plant care tips, early access to new arrivals, and special botanical offers.
            Join 25,000+ plant lovers.
          </p>
          <form className="cta-form" onSubmit={(e) => { e.preventDefault(); showToast('Subscribed! Check your inbox for your 15% discount code 🌱'); }}>
            <input
              className="cta-input"
              type="email"
              placeholder="Enter your email address"
              id="newsletter-email"
              aria-label="Email address"
              required
            />
            <button className="cta-submit" type="submit" id="newsletter-submit">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="nursery-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <span className="nav-logo-text">🌿 Bloomora</span>
            <p className="footer-brand-desc">
              India's most loved online plant nursery. Healthy botanical varieties delivered fresh with Cash on Delivery.
            </p>
            <div className="footer-social">
              <a href="#instagram" aria-label="Instagram">📷</a>
              <a href="#facebook" aria-label="Facebook">📘</a>
              <a href="#twitter" aria-label="Twitter">🐦</a>
              <a href="#youtube" aria-label="YouTube">▶️</a>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Shop Varieties</h4>
            <ul className="footer-links">
              <li><Link to="/plants?category=Indoor%20Plants">Indoor Plants</Link></li>
              <li><Link to="/plants?category=Outdoor%20Plants">Outdoor Plants</Link></li>
              <li><Link to="/plants?category=Air%20Purifiers">Air Purifiers</Link></li>
              <li><Link to="/plants?category=Succulents%20%26%20Cacti">Succulents &amp; Cacti</Link></li>
              <li><Link to="/plants?category=Flowering%20Plants">Flowering Plants</Link></li>
              <li><Link to="/plants">Explore All Plants</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Help &amp; Support</h4>
            <ul className="footer-links">
              <li><Link to="/contact">Contact Us</Link></li>
              <li><a href="#tips" onClick={(e) => { e.preventDefault(); scrollToSection('tips'); }}>Plant Care Guide</a></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><Link to="/about">About Us</Link></li>
              <li><a href="#story" onClick={(e) => { e.preventDefault(); scrollToSection('story'); }}>Our Story</a></li>
              <li><Link to="/admin">Admin Access</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Bloomora Plant Nursery. All rights reserved.</span>
          <span>Made with 🌱 in India</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;