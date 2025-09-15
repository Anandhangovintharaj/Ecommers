import React, { useState, useEffect } from 'react';
import { cart } from '../services/api';
import api from '../services/api'; // Import the default api instance
import RazorpayButton from '../components/RazorpayButton'; // Import RazorpayButton
import './Cart.css';

const Cart = ({ user, addToast }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({});
  const [razorpayOrderId, setRazorpayOrderId] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await cart.get();
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(cartItemId);
      return;
    }

    setUpdating(prev => ({ ...prev, [cartItemId]: true }));
    
    try {
      await cart.update(cartItemId, newQuantity);
      setCartItems(prev => prev.map(item => 
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      addToast(error.response?.data?.error || 'Failed to update quantity', 'error');
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const removeItem = async (cartItemId) => {
    setUpdating(prev => ({ ...prev, [cartItemId]: true }));
    
    try {
      await cart.remove(cartItemId);
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    } catch (error) {
      console.error('Error removing item:', error);
      addToast(error.response?.data?.error || 'Failed to remove item', 'error');
    } finally {
      setUpdating(prev => ({ ...prev, [cartItemId]: false }));
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    try {
      await cart.clear();
      setCartItems([]);
      addToast('Cart cleared successfully!', 'success');
    } catch (error) {
      console.error('Error clearing cart:', error);
      addToast('Failed to clear cart', 'error');
    }
  };

  const calculateTotal = () => {
    return (cartItems && Array.isArray(cartItems))
      ? cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
      : '0.00';
  };

  const getTotalItems = () => {
    return (cartItems && Array.isArray(cartItems))
      ? cartItems.reduce((total, item) => total + item.quantity, 0)
      : 0;
  };

  const createRazorpayOrder = async () => {
    setPaymentLoading(true);
    try {
      const totalAmount = parseFloat(calculateTotal());
      if (totalAmount <= 0) {
        addToast('Cannot create order for zero amount.', 'error');
        setPaymentLoading(false);
        return;
      }

      const response = await api.post('/api/payment/orders', {
        amount: totalAmount,
        currency: 'INR',
      });
      setRazorpayOrderId(response.data.id);
      addToast('Razorpay order created.', 'success');
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      addToast(error.response?.data?.message || 'Failed to create Razorpay order', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    setPaymentLoading(true);
    try {
      const verificationResponse = await api.post('/api/payment/verify', response);
      if (verificationResponse.data.success) {
        addToast('Payment successful and verified!', 'success');
        // Clear cart after successful payment
        await clearCart(); // This will also update cartItems to empty
        setRazorpayOrderId(null);
      } else {
        addToast(verificationResponse.data.message || 'Payment verification failed', 'error');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      addToast(error.response?.data?.message || 'Payment verification failed', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your cart.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-container">
        <div className="error">{error}</div>
        <button onClick={fetchCartItems} className="retry-button">Retry</button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <h2>Your Cart is Empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <a href="/products" className="continue-shopping">Continue Shopping</a>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <p>{getTotalItems()} items in your cart</p>
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems && Array.isArray(cartItems) && cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-image">
                <img 
                  src={item.image_url || '/images/placeholder-100x100.svg'} 
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = '/images/placeholder-100x100.svg';
                  }}
                />
              </div>
              
              <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-description">{item.description}</p>
                <div className="item-price">₹{item.price}</div>
              </div>
              
              <div className="item-quantity">
                <button 
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={updating[item.id]}
                >
                  -
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={updating[item.id]}
                >
                  +
                </button>
              </div>
              
              <div className="item-total">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
              
              <button 
                className="remove-btn"
                onClick={() => removeItem(item.id)}
                disabled={updating[item.id]}
                title="Remove item"
              >
                {updating[item.id] ? '...' : '×'}
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-line">
              <span>Items ({getTotalItems()})</span>
              <span>₹{calculateTotal()}</span>
            </div>
            
            <div className="summary-line">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            
            <div className="summary-line total">
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
            
            {razorpayOrderId ? (
              <RazorpayButton 
                amount={parseFloat(calculateTotal()) * 100} // Razorpay expects amount in paisa
                orderId={razorpayOrderId}
                onPaymentSuccess={handlePaymentSuccess}
                addToast={addToast}
              />
            ) : (
              <button 
                className="checkout-btn"
                onClick={createRazorpayOrder}
                disabled={paymentLoading || getTotalItems() === 0}
              >
                {paymentLoading ? 'Creating Order...' : 'Proceed to Checkout'}
              </button>
            )}
            
            <div className="cart-actions">
              <button onClick={clearCart} className="clear-cart-btn">
                Clear Cart
              </button>
              <a href="/products" className="continue-shopping">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
