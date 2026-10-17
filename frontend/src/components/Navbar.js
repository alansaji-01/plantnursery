import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemsCount, user, logoutUser } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`nursery-nav ${scrolled || !isHome ? 'scrolled is-internal' : ''}`} id="main-nav">
      {/* Brand Logo: Links to /admin for admin, / for customer/guest */}
      <Link
        to={user?.usertype === 'admin' ? '/admin' : '/'}
        className="nav-logo"
        onClick={() => setMobileMenuOpen(false)}
      >
        <span className="nav-logo-icon">🌿</span>
        <span className="nav-logo-text">
          {user?.usertype === 'admin' ? 'Bloomora Admin' : 'Bloomora'}
        </span>
      </Link>

      <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
        {/* ======================================================== */}
        {/* ADMIN INTERFACE: Only administrative navigation links     */}
        {/* ======================================================== */}
        {user?.usertype === 'admin' ? (
          <>
            <li>
              <Link
                to="/admin"
                className={location.pathname === '/admin' && !location.search ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin?tab=plants"
                className={location.pathname === '/admin' && location.search.includes('tab=plants') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Manage Plants
              </Link>
            </li>
            <li>
              <Link
                to="/admin?tab=categories"
                className={location.pathname === '/admin' && location.search.includes('tab=categories') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Manage Categories
              </Link>
            </li>
            <li>
              <Link
                to="/admin?tab=customers"
                className={location.pathname === '/admin' && location.search.includes('tab=customers') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Customers
              </Link>
            </li>
            <li>
              <Link
                to="/admin?tab=purchases"
                className={location.pathname === '/admin' && location.search.includes('tab=purchases') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/admin?tab=messages"
                className={location.pathname === '/admin' && location.search.includes('tab=messages') ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Messages
              </Link>
            </li>

            <li className="user-welcome admin-controls">
              <span className="nav-admin-badge" style={{ margin: 0 }}>🛡️ Admin</span>
              <button onClick={handleLogout} className="btn-logout" title="Log out of admin session">
                Logout
              </button>
            </li>
          </>
        ) : (
          /* ======================================================== */
          /* CUSTOMER & VISITOR INTERFACE                              */
          /* ======================================================== */
          <>
            <li>
              <Link
                to="/"
                className={location.pathname === '/' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/plants"
                className={location.pathname === '/plants' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Shop Plants
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className={location.pathname === '/about' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className={location.pathname === '/contact' ? 'active' : ''}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </li>

            {/* Cart Link with Badge for visitors and customers */}
            <li>
              <Link
                to="/cart"
                className={`nav-cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                🛒 Cart
                {totalItemsCount > 0 && <span className="cart-badge">{totalItemsCount}</span>}
              </Link>
            </li>

            {/* Customer Account / Guest Auth Buttons */}
            {user ? (
              <>
                <li>
                  <Link
                    to="/orders"
                    className={location.pathname === '/orders' ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📦 My Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className={location.pathname === '/profile' ? 'active' : ''}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👤 Profile
                  </Link>
                </li>
                <li className="user-welcome">
                  <span className="user-greeting">Hi, {user.name ? user.name.split(' ')[0] : user.username}</span>
                  <button onClick={handleLogout} className="btn-logout" title="Log out">
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
          </>
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
  );
}

export default Navbar;
