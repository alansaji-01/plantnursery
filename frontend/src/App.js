import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PlantCatalog from './components/PlantCatalog';
import PlantDetail from './components/PlantDetail';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Orders from './components/Orders';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import AdminDashboard from './components/AdminDashboard';
import { AboutUs, ContactUs } from './components/AboutContact';

function App() {
  return (
    <CartProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Homepage with its own integrated hero-transparent navbar */}
            <Route path="/" element={<Home />} />

            {/* Standard internal pages with unified navigation header */}
            <Route
              path="/plants"
              element={
                <>
                  <Navbar />
                  <PlantCatalog />
                </>
              }
            />
            <Route
              path="/plants/:id"
              element={
                <>
                  <Navbar />
                  <PlantDetail />
                </>
              }
            />
            <Route
              path="/cart"
              element={
                <>
                  <Navbar />
                  <Cart />
                </>
              }
            />
            <Route
              path="/checkout"
              element={
                <>
                  <Navbar />
                  <Checkout />
                </>
              }
            />
            <Route
              path="/orders"
              element={
                <>
                  <Navbar />
                  <Orders />
                </>
              }
            />
            <Route
              path="/profile"
              element={
                <>
                  <Navbar />
                  <Profile />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <Navbar />
                  <Login />
                </>
              }
            />
            <Route
              path="/register"
              element={
                <>
                  <Navbar />
                  <Register />
                </>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <>
                  <Navbar />
                  <ForgotPassword />
                </>
              }
            />
            <Route
              path="/admin"
              element={
                <>
                  <Navbar />
                  <AdminDashboard />
                </>
              }
            />
            <Route
              path="/about"
              element={
                <>
                  <Navbar />
                  <AboutUs />
                </>
              }
            />
            <Route
              path="/contact"
              element={
                <>
                  <Navbar />
                  <ContactUs />
                </>
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </CartProvider>
  );
}

export default App;
