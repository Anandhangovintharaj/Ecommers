import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Admin from './pages/Admin'; // Import the new Admin component
import { cart } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  // Check for saved user on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      updateCartCount();
    }
  }, []);

  // Update cart count
  const updateCartCount = async () => {
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      try {
        const response = await cart.get();
        const totalItems = response.data.reduce((total, item) => total + item.quantity, 0);
        setCartItemsCount(totalItems);
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartItemsCount(0);
      }
    } else {
      setCartItemsCount(0);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    updateCartCount();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCartItemsCount(0);
  };

  return (
    <Router>
      <div className="App">
        <Header 
          user={user} 
          cartItemsCount={cartItemsCount} 
          onLogout={handleLogout} 
        />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="/products" element={<Products user={user} onCartUpdate={updateCartCount} />} />
            <Route path="/cart" element={<Cart user={user} />} />
            {user && user.is_admin && (
              <Route path="/admin" element={<Admin user={user} />} />
            )}
            {/* Add more routes as components are created */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
