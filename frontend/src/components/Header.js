import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ user, cartItemsCount, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActiveLink = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>E-Commerce Store</h1>
        </Link>
        
        <nav className="nav">
          <Link to="/" className={`nav-link ${isActiveLink('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/products" className={`nav-link ${isActiveLink('/products') ? 'active' : ''}`}>Products</Link>
          
          {user ? (
            <>
              <Link to="/cart" className={`nav-link cart-link ${isActiveLink('/cart') ? 'active' : ''}`}>
                Cart ({cartItemsCount || 0})
              </Link>
              <Link to="/orders" className={`nav-link ${isActiveLink('/orders') ? 'active' : ''}`}>Orders</Link>
              <span className="user-greeting">Hello, {user.username}!</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActiveLink('/login') ? 'active' : ''}`}>Login</Link>
              <Link to="/register" className={`nav-link ${isActiveLink('/register') ? 'active' : ''}`}>Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
