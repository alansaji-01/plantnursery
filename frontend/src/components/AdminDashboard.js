import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart, getAuthHeaders } from '../context/CartContext';
import './NurseryPages.css';

function AdminDashboard() {
  const { user, handleAuthError, showGlobalMessage, globalMessage, clearGlobalMessage } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: 'plants' | 'categories' | 'customers' | 'purchases' | 'messages'
  const initialTab = searchParams.get('tab') || 'plants';
  const [activeTab, setActiveTab] = useState(
    ['plants', 'categories', 'customers', 'purchases', 'messages'].includes(initialTab) ? initialTab : 'plants'
  );

  const [plants, setPlants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messageFilter, setMessageFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Sync tab state with URL query parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['plants', 'categories', 'customers', 'purchases', 'messages'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  // Plant Modal State
  const [showPlantModal, setShowPlantModal] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [plantForm, setPlantForm] = useState({
    plantName: '',
    botanicalName: '',
    categoryId: '',
    categoryName: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    image: '/images/plant-monstera.jpg',
    badge: '',
    status: 'Available'
  });

  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({
    name: '',
    icon: '🌱',
    description: ''
  });

  // Purchase Details Modal State
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    // Authorization gate: must be authenticated admin
    if (!user) {
      navigate('/login?redirect=/admin&message=' + encodeURIComponent('Please log in to access the Admin Dashboard.'));
      return;
    }
    if (user.usertype !== 'admin') {
      showGlobalMessage('Access denied. Administrator privileges are required.');
      navigate('/');
      return;
    }
    loadAllAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Display incoming redirect message (e.g. "This action is not available to administrator accounts.")
  useEffect(() => {
    if (globalMessage) {
      setToast(globalMessage);
      clearGlobalMessage();
    }
  }, [globalMessage, clearGlobalMessage]);

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Helper for authenticated admin API calls
  const adminFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(user),
      ...(options.headers || {})
    };
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    // Handle session expiry
    if (res.status === 401) {
      handleAuthError(res);
      navigate('/login?redirect=/admin&message=' + encodeURIComponent('Your session has expired. Please log in again.'));
      return { res, data, authFailed: true };
    }

    // Handle forbidden (role changed or tampered)
    if (res.status === 403) {
      showNotification(data.message || 'Access denied.');
      return { res, data, authFailed: true };
    }

    return { res, data, authFailed: false };
  };

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [plantsRes, catsRes, custsRes, purchRes, msgsRes] = await Promise.all([
        fetch('http://localhost:5000/api/plants'),
        fetch('http://localhost:5000/api/categories'),
        fetch('http://localhost:5000/api/admin/customers', { headers: getAuthHeaders(user) }),
        fetch('http://localhost:5000/api/admin/purchases', { headers: getAuthHeaders(user) }),
        fetch('http://localhost:5000/api/contact', { headers: getAuthHeaders(user) })
      ]);

      // Check if admin endpoints returned 401
      if (custsRes.status === 401 || purchRes.status === 401 || msgsRes.status === 401) {
        const errorRes = custsRes.status === 401 ? custsRes : purchRes.status === 401 ? purchRes : msgsRes;
        handleAuthError(errorRes);
        navigate('/login?redirect=/admin&message=' + encodeURIComponent('Your session has expired. Please log in again.'));
        return;
      }

      const pData = await plantsRes.json();
      const cData = await catsRes.json();
      const cuData = await custsRes.json();
      const puData = await purchRes.json();
      const mData = await msgsRes.json();

      if (pData.success) setPlants(pData.plants);
      if (cData.success) setCategories(cData.categories);
      if (cuData.success) setCustomers(cuData.customers);
      if (puData.success) setPurchases(puData.purchases);
      if (mData.success) setContactMessages(mData.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------
  // PLANT CRUD
  // ------------------------------------
  const handleOpenPlantModal = (plant = null) => {
    if (plant) {
      setEditingPlant(plant);
      setPlantForm({
        plantName: plant.plantName,
        botanicalName: plant.botanicalName || '',
        categoryId: plant.categoryId || '',
        categoryName: plant.categoryName || '',
        description: plant.description || '',
        price: plant.price,
        originalPrice: plant.originalPrice || '',
        stock: plant.stock,
        image: plant.image || '/images/plant-monstera.jpg',
        badge: plant.badge || '',
        status: plant.status || 'Available'
      });
    } else {
      setEditingPlant(null);
      setPlantForm({
        plantName: '',
        botanicalName: '',
        categoryId: categories[0]?._id || '',
        categoryName: categories[0]?.name || '',
        description: '',
        price: '',
        originalPrice: '',
        stock: '10',
        image: '/images/plant-monstera.jpg',
        badge: '',
        status: 'Available'
      });
    }
    setShowPlantModal(true);
  };

  const handleSavePlant = async (e) => {
    e.preventDefault();
    try {
      const selectedCatObj = categories.find((c) => c._id === plantForm.categoryId);
      const payload = {
        ...plantForm,
        categoryName: selectedCatObj ? selectedCatObj.name : plantForm.categoryName
      };

      const url = editingPlant
        ? `http://localhost:5000/api/plants/${editingPlant._id}`
        : 'http://localhost:5000/api/plants';
      const method = editingPlant ? 'PUT' : 'POST';

      const { res, data, authFailed } = await adminFetch(url, {
        method,
        body: JSON.stringify(payload)
      });

      if (authFailed) return;
      if (!res.ok || !data.success) throw new Error(data.message || 'Operation failed');

      showNotification(editingPlant ? 'Plant updated successfully!' : 'New plant added successfully!');
      setShowPlantModal(false);
      loadAllAdminData();
    } catch (err) {
      showNotification(err.message);
    }
  };

  const handleDeletePlant = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const { res, data, authFailed } = await adminFetch(`http://localhost:5000/api/plants/${id}`, { method: 'DELETE' });

      if (authFailed) return;
      if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');

      showNotification(`Plant "${name}" deleted.`);
      loadAllAdminData();
    } catch (err) {
      showNotification(err.message);
    }
  };

  // ------------------------------------
  // CATEGORY CRUD
  // ------------------------------------
  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, icon: cat.icon || '🌱', description: cat.description || '' });
    } else {
      setEditingCat(null);
      setCatForm({ name: '', icon: '🌱', description: '' });
    }
    setShowCatModal(true);
  };

  const handleSaveCat = async (e) => {
    e.preventDefault();
    try {
      const url = editingCat
        ? `http://localhost:5000/api/categories/${editingCat._id}`
        : 'http://localhost:5000/api/categories';
      const method = editingCat ? 'PUT' : 'POST';

      const { res, data, authFailed } = await adminFetch(url, {
        method,
        body: JSON.stringify(catForm)
      });

      if (authFailed) return;
      if (!res.ok || !data.success) throw new Error(data.message || 'Operation failed');

      showNotification(editingCat ? 'Category updated!' : 'New category created!');
      setShowCatModal(false);
      loadAllAdminData();
    } catch (err) {
      showNotification(err.message);
    }
  };

  const handleDeleteCat = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) return;
    try {
      const { res, data, authFailed } = await adminFetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' });

      if (authFailed) return;
      if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');

      showNotification(`Category "${name}" deleted.`);
      loadAllAdminData();
    } catch (err) {
      showNotification(err.message);
    }
  };

  // ------------------------------------
  // CONTACT MESSAGES MANAGEMENT
  // ------------------------------------
  const handleUpdateMessageStatus = async (id, newStatus) => {
    try {
      const { res, data, authFailed } = await adminFetch(`http://localhost:5000/api/contact/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (authFailed) return;
      if (!res.ok || !data.success) throw new Error(data.message || 'Status update failed');

      showNotification(`Message status updated to "${newStatus}"`);
      setContactMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: newStatus } : m))
      );
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showNotification(err.message);
    }
  };

  const handleDeleteMessage = async (id, senderName) => {
    if (!window.confirm(`Are you sure you want to delete the message from "${senderName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const { res, data, authFailed } = await adminFetch(`http://localhost:5000/api/contact/${id}`, {
        method: 'DELETE'
      });

      if (authFailed) return;
      if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed');

      showNotification('Contact message deleted successfully.');
      if (selectedMessage && selectedMessage._id === id) {
        setSelectedMessage(null);
      }
      setContactMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      showNotification(err.message);
    }
  };

  const handleOpenMessageModal = (msg) => {
    setSelectedMessage(msg);
    if (msg.status === 'New') {
      handleUpdateMessageStatus(msg._id, 'Read');
    }
  };

  // Block rendering for unauthenticated users and non-admin accounts
  if (!user || user.usertype !== 'admin') {
    return null;
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: '1300px' }}>
      {toast && <div className="toast-msg">{toast}</div>}

      <div className="page-header" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="page-badge">Administrator Console</span>
          <h1 className="page-title" style={{ fontSize: '2.2rem', margin: 0 }}>Nursery Management</h1>
          <p className="page-subtitle" style={{ margin: 0, textAlign: 'left' }}>
            Manage plant inventory, botanical categories, registered customers, and incoming orders.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" onClick={() => handleOpenPlantModal()}>
            + Add New Plant
          </button>
          <button className="btn-secondary" onClick={() => handleOpenCatModal()}>
            + Add Category
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'plants' ? 'active' : ''}`}
          onClick={() => switchTab('plants')}
        >
          🌿 Plant Inventory ({plants.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => switchTab('categories')}
        >
          📁 Categories ({categories.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => switchTab('customers')}
        >
          👥 Registered Customers ({customers.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => switchTab('purchases')}
        >
          📦 Customer Purchases ({purchases.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => switchTab('messages')}
        >
          ✉️ Contact Messages ({contactMessages.length})
          {contactMessages.filter((m) => m.status === 'New').length > 0 && (
            <span style={{
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              marginLeft: '0.45rem'
            }}>
              {contactMessages.filter((m) => m.status === 'New').length} New
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#166534' }}>
          Loading administrative records... 🌿
        </div>
      ) : (
        <>
          {/* TAB 1: PLANTS */}
          {activeTab === 'plants' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Plant Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plants.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <img
                          src={p.image || '/images/plant-monstera.jpg'}
                          alt={p.plantName}
                          style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                      </td>
                      <td>
                        <strong style={{ color: '#166534' }}>{p.plantName}</strong>
                        {p.botanicalName && (
                          <div style={{ fontSize: '0.8rem', color: '#78716c', fontStyle: 'italic' }}>
                            {p.botanicalName}
                          </div>
                        )}
                      </td>
                      <td>{p.categoryName || 'General'}</td>
                      <td>
                        <strong>₹{p.price}</strong>
                        {p.originalPrice && <span style={{ textDecoration: 'line-through', color: '#a8a29e', fontSize: '0.85rem', marginLeft: '0.4rem' }}>₹{p.originalPrice}</span>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: p.stock <= 5 ? '#dc2626' : '#166534' }}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`stock-pill ${p.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {p.stock > 0 ? p.status || 'Available' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-action-btns">
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => handleOpenPlantModal(p)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-danger btn-sm"
                            onClick={() => handleDeletePlant(p._id, p.plantName)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Plants in Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const plantCount = plants.filter((p) => p.categoryName === cat.name || p.categoryId === cat._id).length;
                    return (
                      <tr key={cat._id}>
                        <td style={{ fontSize: '1.5rem' }}>{cat.icon || '🌱'}</td>
                        <td><strong>{cat.name}</strong></td>
                        <td style={{ color: '#57534e', fontSize: '0.9rem', maxWidth: '400px' }}>
                          {cat.description || '—'}
                        </td>
                        <td>
                          <span className="stock-pill in-stock">{plantCount} plants</span>
                        </td>
                        <td>
                          <div className="admin-action-btns">
                            <button className="btn-secondary btn-sm" onClick={() => handleOpenCatModal(cat)}>
                              Edit
                            </button>
                            <button className="btn-danger btn-sm" onClick={() => handleDeleteCat(cat._id, cat.name)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: REGISTERED CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>Phone Number</th>
                    <th>Delivery Address</th>
                    <th>Registered On</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.name}</strong></td>
                      <td><code>{c.username}</code></td>
                      <td>{c.email}</td>
                      <td>{c.phoneNumber || '—'}</td>
                      <td style={{ maxWidth: '300px', fontSize: '0.88rem' }}>{c.address || '—'}</td>
                      <td style={{ fontSize: '0.85rem', color: '#78716c' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: CUSTOMER PURCHASES */}
          {activeTab === 'purchases' && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Payment Mode</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((pur) => (
                    <tr key={pur._id}>
                      <td>
                        <strong style={{ color: '#166534' }}>#{pur._id.slice(-8).toUpperCase()}</strong>
                      </td>
                      <td>
                        <div><strong>{pur.customerName}</strong></div>
                        <div style={{ fontSize: '0.8rem', color: '#78716c' }}>{pur.customerEmail}</div>
                      </td>
                      <td style={{ fontSize: '0.88rem' }}>
                        {new Date(pur.purchaseDate || pur.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {pur.items && pur.items.length > 0 ? (
                          <span>{pur.items.length} plant(s)</span>
                        ) : (
                          <span>1 plant</span>
                        )}
                      </td>
                      <td>
                        <strong style={{ fontSize: '1.05rem', color: '#166534' }}>₹{pur.totalAmount}</strong>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', background: '#fef9c3', color: '#854d0e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          {pur.paymentMethod || 'Cash on Delivery'}
                        </span>
                      </td>
                      <td>
                        <span className="stock-pill in-stock">● {pur.status || 'Confirmed'}</span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => setSelectedPurchase(pur)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: CONTACT MESSAGES */}
          {activeTab === 'messages' && (
            <div>
              {/* Message Filter Pills */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['All', 'New', 'Read', 'Reviewed'].map((statusKey) => {
                    const count = statusKey === 'All'
                      ? contactMessages.length
                      : contactMessages.filter((m) => m.status === statusKey).length;
                    return (
                      <button
                        key={statusKey}
                        onClick={() => setMessageFilter(statusKey)}
                        className={`btn-secondary btn-sm ${messageFilter === statusKey ? 'active' : ''}`}
                        style={{
                          background: messageFilter === statusKey ? '#166534' : '#f5f5f4',
                          color: messageFilter === statusKey ? '#ffffff' : '#44403c',
                          borderColor: messageFilter === statusKey ? '#166534' : '#d6d3d1',
                          fontWeight: 600,
                          borderRadius: '9999px',
                          padding: '0.35rem 0.85rem'
                        }}
                      >
                        {statusKey} ({count})
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#78716c' }}>
                  Showing {
                    messageFilter === 'All'
                      ? contactMessages.length
                      : contactMessages.filter((m) => m.status === messageFilter).length
                  } messages
                </div>
              </div>

              {contactMessages.filter((m) => messageFilter === 'All' || m.status === messageFilter).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e7e5e4' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
                  <h3 style={{ margin: '0 0 0.5rem', color: '#166534', fontSize: '1.2rem' }}>No Messages Found</h3>
                  <p style={{ margin: 0, color: '#78716c', fontSize: '0.92rem' }}>
                    {messageFilter === 'All'
                      ? 'No customer inquiries have been received yet.'
                      : `There are currently no messages marked as "${messageFilter}".`}
                  </p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sender</th>
                        <th>Email</th>
                        <th>Subject & Preview</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactMessages
                        .filter((m) => messageFilter === 'All' || m.status === messageFilter)
                        .map((msg) => (
                          <tr
                            key={msg._id}
                            style={{
                              background: msg.status === 'New' ? 'rgba(254, 243, 199, 0.35)' : 'transparent'
                            }}
                          >
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <strong style={{ color: '#166534' }}>{msg.name}</strong>
                                {msg.customerId && (
                                  <span style={{
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '0.1rem 0.4rem',
                                    borderRadius: '4px'
                                  }}>
                                    Customer
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <a
                                href={`mailto:${msg.email}?subject=Bloomora Inquiry: ${encodeURIComponent(msg.subject || 'Follow-up')}`}
                                style={{ color: '#0284c7', textDecoration: 'none', fontSize: '0.88rem' }}
                                title="Click to send email reply"
                              >
                                {msg.email}
                              </a>
                            </td>
                            <td style={{ maxWidth: '300px' }}>
                              <div style={{ fontWeight: 600, color: '#1c1917', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                {msg.subject || 'General Inquiry'}
                              </div>
                              <div style={{
                                fontSize: '0.82rem',
                                color: '#78716c',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {msg.message}
                              </div>
                            </td>
                            <td style={{ fontSize: '0.85rem', color: '#57534e', whiteSpace: 'nowrap' }}>
                              {new Date(msg.createdAt).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '9999px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  background:
                                    msg.status === 'New'
                                      ? '#fef3c7'
                                      : msg.status === 'Read'
                                      ? '#e0e7ff'
                                      : '#dcfce7',
                                  color:
                                    msg.status === 'New'
                                      ? '#92400e'
                                      : msg.status === 'Read'
                                      ? '#3730a3'
                                      : '#166534',
                                  border: `1px solid ${
                                    msg.status === 'New'
                                      ? '#fde68a'
                                      : msg.status === 'Read'
                                      ? '#c7d2fe'
                                      : '#bbf7d0'
                                  }`
                                }}
                              >
                                {msg.status === 'New' && '● '}
                                {msg.status}
                              </span>
                            </td>
                            <td>
                              <div className="admin-action-btns" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <button
                                  className="btn-primary btn-sm"
                                  onClick={() => handleOpenMessageModal(msg)}
                                  title="Read complete message"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                >
                                  View
                                </button>
                                {msg.status !== 'Reviewed' && (
                                  <button
                                    className="btn-secondary btn-sm"
                                    onClick={() => handleUpdateMessageStatus(msg._id, 'Reviewed')}
                                    title="Mark message as reviewed"
                                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                  >
                                    Reviewed ✓
                                  </button>
                                )}
                                <button
                                  className="btn-danger btn-sm"
                                  onClick={() => handleDeleteMessage(msg._id, msg.name)}
                                  title="Delete message"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* PLANT MODAL */}
      {showPlantModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{editingPlant ? 'Edit Plant' : 'Add New Plant'}</h2>
              <button className="modal-close" onClick={() => setShowPlantModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSavePlant}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="pl-name">Plant Name *</label>
                  <input
                    id="pl-name"
                    type="text"
                    className="form-input"
                    value={plantForm.plantName}
                    onChange={(e) => setPlantForm({ ...plantForm, plantName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pl-botanical">Botanical Name</label>
                  <input
                    id="pl-botanical"
                    type="text"
                    className="form-input"
                    value={plantForm.botanicalName}
                    onChange={(e) => setPlantForm({ ...plantForm, botanicalName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="pl-cat">Category *</label>
                  <select
                    id="pl-cat"
                    className="form-select"
                    value={plantForm.categoryId}
                    onChange={(e) => {
                      const sel = categories.find((c) => c._id === e.target.value);
                      setPlantForm({
                        ...plantForm,
                        categoryId: e.target.value,
                        categoryName: sel ? sel.name : ''
                      });
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pl-badge">Badge (e.g. Bestseller, New, 20% Off)</label>
                  <input
                    id="pl-badge"
                    type="text"
                    className="form-input"
                    value={plantForm.badge}
                    onChange={(e) => setPlantForm({ ...plantForm, badge: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="pl-price">Price (₹) *</label>
                  <input
                    id="pl-price"
                    type="number"
                    className="form-input"
                    value={plantForm.price}
                    onChange={(e) => setPlantForm({ ...plantForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pl-orig">Original Price (₹)</label>
                  <input
                    id="pl-orig"
                    type="number"
                    className="form-input"
                    value={plantForm.originalPrice}
                    onChange={(e) => setPlantForm({ ...plantForm, originalPrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="pl-stock">Available Stock *</label>
                  <input
                    id="pl-stock"
                    type="number"
                    className="form-input"
                    value={plantForm.stock}
                    onChange={(e) => setPlantForm({ ...plantForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pl-image">Image Path or URL</label>
                <input
                  id="pl-image"
                  type="text"
                  className="form-input"
                  value={plantForm.image}
                  onChange={(e) => setPlantForm({ ...plantForm, image: e.target.value })}
                  placeholder="/images/plant-monstera.jpg"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pl-desc">Plant Description</label>
                <textarea
                  id="pl-desc"
                  className="form-textarea"
                  value={plantForm.description}
                  onChange={(e) => setPlantForm({ ...plantForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPlantModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingPlant ? 'Update Plant' : 'Save Plant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {showCatModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{editingCat ? 'Edit Category' : 'New Plant Category'}</h2>
              <button className="modal-close" onClick={() => setShowCatModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveCat}>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-name">Category Name *</label>
                <input
                  id="cat-name"
                  type="text"
                  className="form-input"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-icon">Icon Emoji (e.g. 🌱, 🪴, 🌸)</label>
                <input
                  id="cat-icon"
                  type="text"
                  className="form-input"
                  value={catForm.icon}
                  onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="cat-desc">Description</label>
                <textarea
                  id="cat-desc"
                  className="form-textarea"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCatModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCat ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURCHASE DETAILS MODAL */}
      {selectedPurchase && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">Purchase Details</h2>
              <button className="modal-close" onClick={() => setSelectedPurchase(null)}>✕</button>
            </div>
            <div style={{ marginBottom: '1.5rem', background: '#f5f5f4', padding: '1.25rem', borderRadius: '10px' }}>
              <div><strong>Order Reference:</strong> #{selectedPurchase._id}</div>
              <div><strong>Customer Name:</strong> {selectedPurchase.customerName}</div>
              <div><strong>Email:</strong> {selectedPurchase.customerEmail || 'N/A'}</div>
              <div><strong>Phone:</strong> {selectedPurchase.customerPhone || 'N/A'}</div>
              <div><strong>Shipping Address:</strong> {selectedPurchase.shippingAddress}</div>
              <div><strong>Purchase Date:</strong> {new Date(selectedPurchase.purchaseDate || selectedPurchase.createdAt).toLocaleString()}</div>
              <div><strong>Payment Mode:</strong> {selectedPurchase.paymentMethod || 'Cash on Delivery'}</div>
            </div>

            <h3 style={{ fontSize: '1.1rem', color: '#166534', marginBottom: '0.75rem' }}>Purchased Plant Line Items:</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {selectedPurchase.items && selectedPurchase.items.length > 0 ? (
                selectedPurchase.items.map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f0f0ee' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={it.image || '/images/plant-monstera.jpg'} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <strong>{it.plantName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#78716c' }}>Qty: {it.quantity} × ₹{it.price}</div>
                      </div>
                    </div>
                    <strong style={{ color: '#166534' }}>₹{it.price * it.quantity}</strong>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Plant Item (Qty: {selectedPurchase.quantity || 1})</span>
                  <span>₹{selectedPurchase.totalAmount}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, borderTop: '2px solid #e7e5e4', paddingTop: '1rem' }}>
              <span>Total Amount:</span>
              <span style={{ color: '#166534' }}>₹{selectedPurchase.totalAmount}</span>
            </div>

            <div style={{ textAlign: 'right', marginTop: '1.5rem' }}>
              <button className="btn-primary" onClick={() => setSelectedPurchase(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTACT MESSAGE DETAILS MODAL */}
      {selectedMessage && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Customer Message Details</h2>
              <button className="modal-close" onClick={() => setSelectedMessage(null)}>✕</button>
            </div>

            {/* Sender and Message Meta */}
            <div style={{ background: '#f5f5f4', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: '#78716c', fontSize: '0.8rem', display: 'block' }}>Sender Name</span>
                  <strong>{selectedMessage.name}</strong>
                </div>
                <div>
                  <span style={{ color: '#78716c', fontSize: '0.8rem', display: 'block' }}>Email Address</span>
                  <a href={`mailto:${selectedMessage.email}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
                    {selectedMessage.email}
                  </a>
                </div>
                <div>
                  <span style={{ color: '#78716c', fontSize: '0.8rem', display: 'block' }}>Received On</span>
                  <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ color: '#78716c', fontSize: '0.8rem', display: 'block' }}>Customer Account</span>
                  <span>
                    {selectedMessage.customerId ? (
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>● Verified Customer</span>
                    ) : (
                      <span style={{ color: '#78716c' }}>Website Visitor</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Status Quick Updater */}
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#57534e', fontWeight: 600 }}>Update Status:</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {['New', 'Read', 'Reviewed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateMessageStatus(selectedMessage._id, st)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: selectedMessage.status === st ? '2px solid #166534' : '1px solid #d6d3d1',
                        background: selectedMessage.status === st ? '#dcfce7' : '#ffffff',
                        color: selectedMessage.status === st ? '#166534' : '#57534e'
                      }}
                    >
                      {selectedMessage.status === st && '✓ '}
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ color: '#78716c', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>Subject</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534' }}>
                {selectedMessage.subject || 'General Inquiry'}
              </div>
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ color: '#78716c', fontSize: '0.8rem', display: 'block', marginBottom: '0.4rem' }}>Message Content</span>
              <div style={{
                background: '#fafaf9',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid #e7e5e4',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: '#292524',
                whiteSpace: 'pre-wrap',
                maxHeight: '260px',
                overflowY: 'auto'
              }}>
                {selectedMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e7e5e4', paddingTop: '1.25rem' }}>
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => handleDeleteMessage(selectedMessage._id, selectedMessage.name)}
                style={{ padding: '0.5rem 1rem' }}
              >
                🗑️ Delete Message
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <a
                  href={`mailto:${selectedMessage.email}?subject=Bloomora: Re: ${encodeURIComponent(selectedMessage.subject || 'Your Inquiry')}`}
                  className="btn-primary btn-sm"
                  style={{ textDecoration: 'none', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  ✉️ Reply via Email
                </a>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setSelectedMessage(null)}
                  style={{ padding: '0.5rem 1rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
