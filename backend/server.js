const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express(); // Declare app globally

// Initialize MySQL database
const { initDatabase } = require('./config/mysql-database');

const startServer = async () => {
  await initDatabase();

  // Import routes
  const authRoutes = require('./routes/auth-mysql');
  const productRoutes = require('./routes/products');
  const cartRoutes = require('./routes/cart');
  const orderRoutes = require('./routes/orders');
  const slideshowRoutes = require('./routes/slideshow');
  const uploadRoutes = require('./routes/upload'); // Import upload routes
  const paymentRoutes = require('./routes/payment'); // Import payment routes

  // const app = express(); // Moved declaration outside
  const PORT = process.env.PORT || 5000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/images', express.static('public/images')); // Serve static images from public/images

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/slideshow', slideshowRoutes);
  app.use('/api/upload', uploadRoutes); // Use upload routes
  app.use('/api/payment', paymentRoutes); // Use payment routes

  // Basic health check route
  app.get('/api/health', (req, res) => {
    res.json({ message: 'Ecommerce API is running!', timestamp: new Date().toISOString() });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
