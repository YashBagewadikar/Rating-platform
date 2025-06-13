import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all stores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as rating,
             COUNT(r.rating) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;
    
    const params = [];

    if (search) {
      query += ` AND (s.name LIKE ? OR s.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY s.id ORDER BY s.${sortBy} ${sortOrder}`;

    const [stores] = await pool.execute(query, params);

    // If user is not admin, also get their ratings for each store
    if (req.user.role !== 'admin') {
      const storeIds = stores.map(store => store.id);
      if (storeIds.length > 0) {
        const [userRatings] = await pool.execute(
          `SELECT store_id, rating FROM ratings WHERE user_id = ? AND store_id IN (${storeIds.map(() => '?').join(',')})`,
          [req.user.id, ...storeIds]
        );

        const ratingsMap = userRatings.reduce((acc, rating) => {
          acc[rating.store_id] = rating.rating;
          return acc;
        }, {});

        stores.forEach(store => {
          store.user_rating = ratingsMap[store.id] || null;
        });
      }
    }

    res.json(stores);
  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create store (admin only)
router.post('/', authenticateToken, requireRole(['admin']), [
  body('name').isLength({ min: 1, max: 60 }).withMessage('Store name is required (max 60 characters)'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('address').isLength({ min: 1, max: 400 }).withMessage('Address is required (max 400 characters)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, address } = req.body;

    // Check if store exists
    const [existingStores] = await pool.execute(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );

    if (existingStores.length > 0) {
      return res.status(400).json({ error: 'Store with this email already exists' });
    }

    // Create store
    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address) VALUES (?, ?, ?)',
      [name, email, address]
    );

    res.status(201).json({ 
      message: 'Store created successfully',
      storeId: result.insertId 
    });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get store ratings (for store owner)
router.get('/:id/ratings', authenticateToken, requireRole(['store_owner', 'admin']), async (req, res) => {
  try {
    const storeId = req.params.id;

    // Check if store owner can access this store
    if (req.user.role === 'store_owner' && req.user.store_id != storeId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [ratings] = await pool.execute(`
      SELECT r.rating, r.created_at, u.name as user_name, u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `, [storeId]);

    const [avgRating] = await pool.execute(`
      SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_ratings
      FROM ratings 
      WHERE store_id = ?
    `, [storeId]);

    res.json({
      ratings,
      average_rating: avgRating[0].average_rating,
      total_ratings: avgRating[0].total_ratings
    });
  } catch (error) {
    console.error('Get store ratings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;