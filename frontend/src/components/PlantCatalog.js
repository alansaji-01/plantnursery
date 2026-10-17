import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './NurseryPages.css';

function PlantCatalog() {
  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCat = searchParams.get('category') || 'All';
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const { addToCart, user, showGlobalMessage } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plantsRes, catsRes] = await Promise.all([
        fetch('http://localhost:5000/api/plants'),
        fetch('http://localhost:5000/api/categories')
      ]);
      const plantsData = await plantsRes.json();
      const catsData = await catsRes.json();

      if (plantsData.success) setPlants(plantsData.plants);
      if (catsData.success) setCategories(catsData.categories);
    } catch (err) {
      console.error('Failed to load plants:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (name) => {
    setToast(`Added "${name}" to your cart! 🌿`);
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
    showToast(plant.plantName);
  };

  const handleSelectCategory = (catName) => {
    setVisibleCount(12);
    if (catName === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catName);
    }
    setSearchParams(searchParams);
  };

  const filteredPlants = plants.filter((plant) => {
    const matchesCategory =
      selectedCat === 'All' ||
      plant.categoryName?.toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch =
      plant.plantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plant.botanicalName && plant.botanicalName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-wrapper">
      {toast && <div className="toast-msg">{toast}</div>}

      <div className="page-header">
        <span className="page-badge">Explore Our Greenhouse</span>
        <h1 className="page-title">Hand-Grown Plant Catalog</h1>
        <p className="page-subtitle">
          Find the perfect plants for your home, balcony, or office. Grown with love and shipped safely to your door.
        </p>
      </div>

      {/* Category Pills Filter */}
      <div className="category-pills" style={{ justifyContent: 'center' }}>
        <button
          className={`cat-pill ${selectedCat === 'All' ? 'active' : ''}`}
          onClick={() => handleSelectCategory('All')}
        >
          🌿 All Plants
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            className={`cat-pill ${selectedCat === cat.name ? 'active' : ''}`}
            onClick={() => handleSelectCategory(cat.name)}
          >
            <span>{cat.icon || '🌱'}</span> {cat.name}
          </button>
        ))}
      </div>

      {/* Search and stats bar */}
      <div className="catalog-toolbar">
        <div className="search-box">
          <input
            type="text"
            className="form-input"
            placeholder="🔍 Search plants by name or botanical family..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(12);
            }}
          />
        </div>
        <div style={{ color: '#78716c', fontSize: '0.95rem', fontWeight: 600 }}>
          {filteredPlants.length > visibleCount
            ? `Showing ${visibleCount} plants (${filteredPlants.length - visibleCount} more remaining)`
            : `Showing all available varieties`}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#166534', fontSize: '1.2rem' }}>
          Loading nursery plants... 🌿
        </div>
      ) : filteredPlants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', background: '#fff', borderRadius: '16px' }}>
          <span style={{ fontSize: '3rem' }}>🪴</span>
          <h3 style={{ marginTop: '1rem', color: '#44403c' }}>No plants found</h3>
          <p style={{ color: '#78716c' }}>Try adjusting your search query or selecting a different category.</p>
          <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => { setSearchTerm(''); handleSelectCategory('All'); }}>
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="catalog-grid">
            {filteredPlants.slice(0, visibleCount).map((plant) => (
              <div key={plant._id} className="plant-card">
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
                        title={plant.stock > 0 ? 'Add to Cart' : 'Out of stock'}
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

          {visibleCount < filteredPlants.length && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button
                className="btn-primary"
                style={{ padding: '0.85rem 2.2rem', fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(22, 101, 52, 0.2)' }}
                onClick={() => setVisibleCount((prev) => prev + 12)}
              >
                🌿 Show Remaining Plants ({filteredPlants.length - visibleCount} more)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PlantCatalog;
