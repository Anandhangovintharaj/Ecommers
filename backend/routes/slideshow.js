const express = require('express');
const router = express.Router();
const { execute: db } = require('../config/mysql-database'); // Correctly destructure and alias
const { authenticateToken } = require('../middleware/auth');

// Get all active slideshow images (public route)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, image_url, title, subtitle, display_order 
      FROM slideshow 
      ORDER BY display_order ASC
    `;
    
    const rows = await db(query);
    console.log('Slideshow backend raw data from DB:', rows); // Keep for debugging
    res.json({
      success: true,
      data: Array.isArray(rows) ? rows : [] // Ensure data is always an array
    });
  } catch (error) {
    console.error('Error fetching slideshow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch slideshow images'
    });
  }
});

// Admin routes (require authentication)
// Get all slideshow images including inactive ones
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM slideshow 
      ORDER BY display_order ASC, created_at DESC
    `;
    
    const [rows] = await db(query);
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching all slideshow images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch slideshow images'
    });
  }
});

// Create new slideshow image
router.post('/admin', authenticateToken, async (req, res) => {
  try {
    const { image_url, title, subtitle, display_order = 1, is_active = true } = req.body;
    
    if (!image_url) {
      return res.status(400).json({
        success: false,
        error: 'Image URL is required'
      });
    }

    const query = `
      INSERT INTO slideshow (image_url, title, subtitle, display_order, is_active)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db(query, [image_url, title, subtitle, display_order, is_active]);
    
    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        image_url,
        title,
        subtitle,
        display_order,
        is_active
      }
    });
  } catch (error) {
    console.error('Error creating slideshow image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create slideshow image'
    });
  }
});

// Update slideshow image
router.put('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, title, subtitle, display_order, is_active } = req.body;
    
    const query = `
      UPDATE slideshow 
      SET image_url = ?, title = ?, subtitle = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `;
    
    const [result] = await db(query, [image_url, title, subtitle, display_order, is_active, id]);
    
    if (result.changedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Slideshow image not found or no changes made'
      });
    }
    
    res.json({
      success: true,
      message: 'Slideshow image updated successfully'
    });
  } catch (error) {
    console.error('Error updating slideshow image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update slideshow image'
    });
  }
});

// Delete slideshow image
router.delete('/admin/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'DELETE FROM slideshow WHERE id = ?';
    const [result] = await db(query, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Slideshow image not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Slideshow image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting slideshow image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete slideshow image'
    });
  }
});

module.exports = router;
