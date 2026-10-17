import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

// Helper: build auth headers from user object
export function getAuthHeaders(user) {
  if (!user || !user.id || !user.usertype) return {};
  return {
    'x-user-id': user.id || user._id,
    'x-user-type': user.usertype
  };
}

// Helper: make an authenticated fetch request with standard error handling
export async function authFetch(url, options = {}, user = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(user ? getAuthHeaders(user) : {}),
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  return { res, data };
}

export function CartProvider({ children }) {
  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('bloomora_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User state persisted in localStorage
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('bloomora_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Global notification message state (used across components for redirects with messages)
  const [globalMessage, setGlobalMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('bloomora_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('bloomora_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('bloomora_user');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  const addToCart = (plant, quantity = 1) => {
    // Block admin users from modifying cart or purchasing
    if (user && user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.plantId === (plant._id || plant.id));
      if (existing) {
        return prevCart.map((item) =>
          item.plantId === (plant._id || plant.id)
            ? { ...item, quantity: Math.min(item.quantity + quantity, plant.stock || 99) }
            : item
        );
      }
      return [
        ...prevCart,
        {
          plantId: plant._id || plant.id,
          plantName: plant.plantName || plant.name,
          categoryName: plant.categoryName || plant.category || 'General',
          price: Number(plant.price) || 0,
          originalPrice: plant.originalPrice,
          image: plant.image || '/images/plant-monstera.jpg',
          stock: plant.stock !== undefined ? plant.stock : 99,
          quantity: Math.min(quantity, plant.stock || 1)
        }
      ];
    });
  };

  const updateQuantity = (plantId, newQty) => {
    if (user && user.usertype === 'admin') {
      showGlobalMessage('This action is not available to administrator accounts.');
      return;
    }

    if (newQty <= 0) {
      removeFromCart(plantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.plantId === plantId) {
          const clampedQty = Math.min(newQty, item.stock || 99);
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (plantId) => {
    if (user && user.usertype === 'admin') {
      return;
    }
    setCart((prevCart) => prevCart.filter((item) => item.plantId !== plantId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const loginUser = (userData) => {
    setUser(userData);
    // If logging in as admin, ensure cart is empty
    if (userData && userData.usertype === 'admin') {
      setCart([]);
      localStorage.removeItem('bloomora_cart');
    }
  };

  const logoutUser = useCallback(() => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('bloomora_user');
    localStorage.removeItem('bloomora_cart');
  }, []);

  // Handle expired/invalid sessions from API responses
  const handleAuthError = useCallback((res) => {
    if (res.status === 401 && user) {
      // Session is invalid — clear auth state
      logoutUser();
      setGlobalMessage('Your session has expired. Please log in again.');
      return true;
    }
    return false;
  }, [user, logoutUser]);

  const showGlobalMessage = useCallback((msg) => {
    setGlobalMessage(msg);
  }, []);

  const clearGlobalMessage = useCallback(() => {
    setGlobalMessage('');
  }, []);

  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        totalPrice,
        user,
        loginUser,
        logoutUser,
        handleAuthError,
        globalMessage,
        showGlobalMessage,
        clearGlobalMessage
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
