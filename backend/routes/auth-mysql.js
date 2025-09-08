const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/mysql-database');

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: 'Username or email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, first_name, last_name, phone]
    );

    // Create JWT token
    const token = jwt.sign(
      { 
        id: result.insertId, 
        username: username,
        email: email,
        is_admin: false
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        username,
        email,
        first_name,
        last_name,
        phone,
        is_admin: false // Default to false for new registrations
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Change from username to email

    // Validate required fields
    if (!email || !password) { // Change from username to email
      return res.status(400).json({
        error: 'Email and password are required' // Update error message
      });
    }

    // Find user by email
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?', // Search by email
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email,
        is_admin: user.is_admin
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        is_admin: user.is_admin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [users] = await pool.execute(
      'SELECT id, username, email, first_name, last_name, phone, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
