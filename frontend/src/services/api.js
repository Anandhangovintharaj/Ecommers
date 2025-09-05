import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication API calls
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Products API calls
export const products = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  getCategories: () => api.get('/products/categories/all'),
};

// Cart API calls
export const cart = {
  get: () => api.get('/cart'),
  add: (productId, quantity) => api.post('/cart/add', { product_id: productId, quantity }),
  update: (cartItemId, quantity) => api.put(`/cart/update/${cartItemId}`, { quantity }),
  remove: (cartItemId) => api.delete(`/cart/remove/${cartItemId}`),
  clear: () => api.delete('/cart/clear'),
};

// Orders API calls
export const orders = {
  get: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (shippingAddress) => api.post('/orders/create', { shipping_address: shippingAddress }),
};

// Slideshow API calls
export const slideshow = {
  get: () => api.get('/slideshow'),
  // Admin functions
  getAll: () => api.get('/slideshow/admin'),
  create: (data) => api.post('/slideshow/admin', data),
  update: (id, data) => api.put(`/slideshow/admin/${id}`, data),
  delete: (id) => api.delete(`/slideshow/admin/${id}`),
};

export default api;
