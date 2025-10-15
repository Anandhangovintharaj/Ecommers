import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="notfound-page">
      <div className="notfound-content">
        <div className="notfound-graphic" aria-hidden="true">
          {/* A simple friendly SVG illustration */}
          <svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="320" height="240" rx="16" fill="#f3f4f6" />
            <g transform="translate(40,28)">
              <circle cx="120" cy="64" r="48" fill="#fff" stroke="#e5e7eb" />
              <path d="M88 94c8-8 24-8 32 0" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="104" cy="56" r="6" fill="#111827" />
              <circle cx="136" cy="56" r="6" fill="#111827" />
              <rect x="0" y="140" width="240" height="20" rx="4" fill="#e6eef8" />
              <rect x="24" y="160" width="192" height="12" rx="3" fill="#e9eff7" />
            </g>
          </svg>
        </div>

        <h1 className="nf-title">404</h1>
        <h2 className="nf-subtitle">Page not found</h2>
        <p className="nf-message">We can't find the page you're looking for. It may have been moved or deleted.</p>

        <Link to="/" className="nf-button">Go back home</Link>
      </div>
    </div>
  );
};

export default NotFound;
