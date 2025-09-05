import React, { useState, useEffect } from 'react';
import { products, cart } from '../services/api';
import { ToastManager } from '../components/Toast';
import './Products.css';

const Products = ({ user, onCartUpdate }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingToCart, setAddingToCart] = useState({});
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Toast functions
  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    setToasts(prev => [...prev, toast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        products.getAll(),
        products.getCategories()
      ]);
      
      setAllProducts(productsResponse.data);
      setFilteredProducts(productsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === '') {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => product.category_id === parseInt(categoryId));
      setFilteredProducts(filtered);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      addToast('Please log in to add items to cart', 'info');
      return;
    }

    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    try {
      await cart.add(productId, 1);
      const product = filteredProducts.find(p => p.id === productId);
      addToast(`${product?.name || 'Item'} added to cart successfully! 🛒`, 'success');
      
      // Update cart count in parent component
      if (onCartUpdate) {
        onCartUpdate();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      addToast(error.response?.data?.error || 'Failed to add item to cart', 'error');
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-container">
        <div className="error">{error}</div>
        <button onClick={fetchData} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <>
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <div className="products-container">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Discover our amazing collection of products</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <label htmlFor="category-select">Filter by Category:</label>
        <select 
          id="category-select"
          value={selectedCategory} 
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="category-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try selecting a different category or check back later.</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img 
                  src={product.image_url || '/images/placeholder-300x300.svg'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/images/placeholder-300x300.svg';
                  }}
                />
                {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                  <div className="low-stock-badge">Only {product.stock_quantity} left!</div>
                )}
                {product.stock_quantity === 0 && (
                  <div className="out-of-stock-badge">Out of Stock</div>
                )}
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category_name}</p>
                <p className="product-description">{product.description}</p>
                <div className="product-price">${product.price}</div>
                
                <div className="product-actions">
                  <button
                    className={`add-to-cart-btn ${product.stock_quantity === 0 ? 'disabled' : ''}`}
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock_quantity === 0 || addingToCart[product.id]}
                  >
                    {addingToCart[product.id] ? 'Adding...' : 
                     product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        Showing {filteredProducts.length} of {allProducts.length} products
        {selectedCategory && (
          <span className="filter-info">
            {' '}in {categories.find(c => c.id === parseInt(selectedCategory))?.name}
          </span>
        )}
      </div>
    </div>
    </>
  );
};

export default Products;
