const express = require('express');
const { execute: db } = require('../config/mysql-database'); // Correctly destructure and alias
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await db(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error fetching products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [products] = await db(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
    
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error fetching product' });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const [products] = await db(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.created_at DESC
    `, [categoryId]);
    
    res.json(products);
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ error: 'Server error fetching products by category' });
  }
});

// Get all categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await db('SELECT * FROM categories ORDER BY name');
    console.log('Backend categories response:', categories);
    res.json(Array.isArray(categories) ? categories : []);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
});

// Admin: Get all products (for admin panel)
router.get('/admin/all', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const products = await db(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (error) {
    console.error('Admin Get all products error:', error);
    res.status(500).json({ error: 'Server error fetching all products for admin' });
  }
});

// Admin: Create a new category
router.post('/admin/categories', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const [result] = await db('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description]);
    
    res.status(201).json({
      message: 'Category created successfully',
      category: { id: result.insertId, name, description }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Server error creating category' });
  }
});

// Admin: Update a category
router.put('/admin/categories/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const [result] = await db('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, description, id]);
    
    if (result.changedRows === 0) {
      return res.status(404).json({ error: 'Category not found or no changes made' });
    }
    
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Server error updating category' });
  }
});

// Admin: Delete a category
router.delete('/admin/categories/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await db('DELETE FROM categories WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Server error deleting category' });
  }
});

// Admin: Create a new product
router.post('/admin/products', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;

    if (!name || !price || !stock_quantity || !category_id) {
      return res.status(400).json({ error: 'Name, price, stock quantity, and category ID are required' });
    }

    const [result] = await db(
      'INSERT INTO products (name, description, price, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, price, stock_quantity, category_id, image_url]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: { id: result.insertId, name, description, price, stock_quantity, category_id, image_url }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Server error creating product' });
  }
});

// Admin: Update a product
router.put('/admin/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;

    if (!name || !price || !stock_quantity || !category_id) {
      return res.status(400).json({ error: 'Name, price, stock quantity, and category ID are required' });
    }

    const [result] = await db(
      'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?, image_url = ? WHERE id = ?',
      [name, description, price, stock_quantity, category_id, image_url, id]
    );

    if (result.changedRows === 0) {
      return res.status(404).json({ error: 'Product not found or no changes made' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Server error updating product' });
  }
});

// Admin: Delete a product
router.delete('/admin/products/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Server error deleting product' });
  }
});

module.exports = router;
