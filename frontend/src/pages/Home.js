import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { slideshow } from '../services/api';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideshowImages, setSlideshowImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch slideshow data from API
  useEffect(() => {
    const fetchSlideshowData = async () => {
      try {
        setLoading(true);
        const response = await slideshow.get();
        console.log('Slideshow API response:', response.data); // Add this line
        if (response.data.success) {
          setSlideshowImages(response.data.data);
        } else {
          setError('Failed to load slideshow images');
        }
      } catch (err) {
        console.error('Error fetching slideshow:', err);
        setError('Failed to load slideshow images');
      } finally {
        setLoading(false);
      }
    };

    fetchSlideshowData();
  }, []);

  // Auto-slide timer
  useEffect(() => {
    if (slideshowImages.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [slideshowImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="home">
        <div className="slideshow-container">
          <div className="loading-message">
            Loading slideshow...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home">
        <div className="slideshow-container">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (slideshowImages.length === 0) {
    return (
      <div className="home">
        <div className="slideshow-container">
          <div className="no-slides-message">
            <p>No slideshow images available</p>
            <Link to="/products" className="shop-now-btn">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="slideshow-container">
        <div className="slides">
          {slideshowImages && slideshowImages.map((image, index) => (
            <div
              key={image.id}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image.image_url})` }}
            >
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <button className="nav-arrow prev" onClick={prevSlide}>
          &#8249;
        </button>
        <button className="nav-arrow next" onClick={nextSlide}>
          &#8250;
        </button>
        
        {/* Dot indicators */}
        <div className="dots-container">
          {slideshowImages.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            >
            </button>
          ))}
        </div>
        
        {/* Shop Now Button */}
        <div className="shop-now-container">
          <Link to="/products" className="shop-now-btn">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
