const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { execute: db } = require('../config/mysql-database');
const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userId to req.user.id
    
    const cartItems = await db(`
      SELECT c.*, p.name, p.price, p.image_url, (c.quantity * p.price) as total_price
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [userId]);
    
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error - details:', error); // More detailed error logging
    res.status(500).json({ error: 'Server error fetching cart' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const [products] = await db(
      'SELECT * FROM products WHERE id = ?',
      [product_id]
    );
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    const existingItems = await db(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existingItems && existingItems.length > 0) {
      // Update quantity
      await db(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, product_id]
      );
    } else {
      // Add new item
      await db(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, product_id, quantity]
      );
    }
    
    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error - details:', error); // More detailed error logging
    res.status(500).json({ error: 'Server error adding to cart' });
  }
});

// Update cart item quantity
router.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userId to req.user.id
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0' });
    }
    
    await db(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, userId]
    );
    
    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Server error updating cart' });
  }
});

// Remove item from cart
router.delete('/remove/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userId to req.user.id
    const { id } = req.params;
    
    await db('DELETE FROM cart WHERE id = ? AND user_id = ?', [id, userId]);
    
    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error removing from cart' });
  }
});

// Clear all items from cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Changed from req.user.userId to req.user.id
    
    await db('DELETE FROM cart WHERE user_id = ?', [userId]);
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error clearing cart' });
  }
});

module.exports = router;
