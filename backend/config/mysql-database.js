const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ecommerce_db',
  port: process.env.DB_PORT || 3306,
  multipleStatements: true
};

// Create connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database and tables
const initDatabase = async () => {
  try {
    // First connect without database to create it
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    const tempConnection = await mysql.createConnection(tempConfig);
    
    // Create database if it doesn't exist
    await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await tempConnection.end();
    
    console.log(`Database '${dbConfig.database}' created or already exists`);
    
    // Now connect with database and create tables
    const connection = await pool.getConnection();
    
    try {
      // Users table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(50),
          last_name VARCHAR(50),
          phone VARCHAR(15),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Categories table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Products table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          stock_quantity INT DEFAULT 0,
          category_id INT,
          image_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        )
      `);

      // Cart table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS cart (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_product (user_id, product_id)
        )
      `);

      // Orders table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          total_amount DECIMAL(10, 2) NOT NULL,
          status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
          shipping_address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Order Items table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `);

      // Slideshow table
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS slideshow (
          id INT AUTO_INCREMENT PRIMARY KEY,
          image_url VARCHAR(500) NOT NULL,
          title VARCHAR(200),
          subtitle VARCHAR(200),
          display_order INT DEFAULT 1,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Insert sample categories if none exist
      const [categoryRows] = await connection.execute('SELECT COUNT(*) as count FROM categories');
      if (categoryRows[0].count === 0) {
        await connection.execute(`
          INSERT INTO categories (name, description) VALUES
          ('Electronics', 'Electronic devices and accessories'),
          ('Mobile', 'Smartphones, tablets and mobile accessories'),
          ('Clothing', 'Fashion and apparel'),
          ('Books', 'Books and educational materials'),
          ('Home & Garden', 'Home improvement and gardening items')
        `);
        console.log('Sample categories inserted');
      }

      // Insert sample products if none exist
      const [productRows] = await connection.execute('SELECT COUNT(*) as count FROM products');
      if (productRows[0].count === 0) {
        await connection.execute(`
          INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES
          ('Smartphone', 'Latest Android smartphone with great features', 599.99, 50, 1, '/images/placeholder-300x300.svg'),
          ('Laptop', 'High-performance laptop for work and gaming', 1299.99, 25, 1, '/images/placeholder-300x300.svg'),
          ('iPhone 15 Pro', 'Latest iPhone with advanced camera system and A17 Pro chip', 999.99, 30, 2, '/images/placeholder-300x300.svg'),
          ('Samsung Galaxy S24', 'Premium Android phone with AI-powered features', 849.99, 40, 2, '/images/placeholder-300x300.svg'),
          ('iPad Air', 'Powerful tablet for work and creativity', 599.99, 20, 2, '/images/placeholder-300x300.svg'),
          ('AirPods Pro', 'Wireless earbuds with active noise cancellation', 249.99, 100, 2, '/images/placeholder-300x300.svg'),
          ('Phone Case', 'Protective case for smartphones', 29.99, 200, 2, '/images/placeholder-300x300.svg'),
          ('Wireless Charger', 'Fast wireless charging pad', 39.99, 75, 2, '/images/placeholder-300x300.svg'),
          ('T-Shirt', 'Comfortable cotton t-shirt', 19.99, 100, 3, '/images/placeholder-300x300.svg'),
          ('Jeans', 'Classic blue jeans', 79.99, 75, 3, '/images/placeholder-300x300.svg'),
          ('Programming Book', 'Learn web development', 39.99, 30, 4, '/images/placeholder-300x300.svg'),
          ('Plant Pot', 'Beautiful ceramic plant pot', 24.99, 40, 5, '/images/placeholder-300x300.svg')
        `);
        console.log('Sample products inserted');
      }

      // Insert sample slideshow data if none exist
      const [slideshowRows] = await connection.execute('SELECT COUNT(*) as count FROM slideshow');
      if (slideshowRows[0].count === 0) { // Comment out this line
        await connection.execute(`
          INSERT INTO slideshow (image_url, title, subtitle, display_order, is_active) VALUES
          ('/images/ps4-game-1.svg', 'The Last of Us Part II', 'Action Adventure', 1, TRUE),
          ('/images/ps4-game-2.svg', 'God of War', 'Action RPG', 2, TRUE),
          ('/images/ps4-game-3.svg', 'Spider-Man', 'Open World Action', 3, TRUE)
        `);
        console.log('Sample slideshow data inserted');
       }

      console.log('MySQL database initialized successfully');
      
    } finally {
      connection.release();
    }
    
  } catch (error) {
    console.error('Error initializing MySQL database:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error);
    return false;
  }
};

module.exports = {
  pool,
  initDatabase,
  testConnection,
  execute: async (sql, params = []) => {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
};
