import React, { useEffect, useState } from 'react';
import { orders } from '../services/api';
import './Order.css';

const Order = ({ user }) => {
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('User in Order component:', user);
      const res = await orders.get(user);
      setOrderList(res.data || []);
    } catch (err) {
      console.error('Error fetching orders', err);
      setError(err.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="orders-container">
        <div className="orders-empty">Please log in to view your orders.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-container">
        <div className="orders-loading">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="orders-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1 className="orders-title">Your Orders</h1>
      {orderList.length === 0 ? (
        <div className="orders-empty">You have not placed any orders yet.</div>
      ) : (
        <div className="orders-list">
          {orderList.map(order => (
            <div className="order-card" key={order.id}>
              <div className="order-left">
                <div className="order-meta">
                  <div><strong>Order ID:</strong> #{order.id}</div>
                  <div><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</div>
                  <div><strong>Total:</strong> ₹{order.total_amount}</div>
                  <div><strong>Items:</strong> {order.item_count}</div>
                </div>
                <div className="order-items-preview">{order.items}</div>
              </div>

              <div className="order-right">
                <div className={`order-status ${order.status}`}>{order.status}</div>
                <button className="order-details-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;
