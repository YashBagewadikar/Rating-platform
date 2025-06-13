import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Submit or update rating
router.post('/', authenticateToken, requireRole(['user']), [
  body('store_id').isInt({ min: 1 }).withMessage('Valid store ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { store_id, rating } = req.body;
    const user_id = req.user.id;

    // Check if store exists
    const [stores] = await pool.execute(
      'SELECT id FROM stores WHERE id = ?',
      [store_id]
    );

    if (stores.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Check if rating already exists
    const [existingRatings] = await pool.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    );

    if (existingRatings.length > 0) {
      // Update existing rating
      await pool.execute(
        'UPDATE ratings SET rating = ? WHERE user_id = ? AND store_id = ?',
        [rating, user_id, store_id]
      );
      res.json({ message: 'Rating updated successfully' });
    } else {
      // Create new rating
      await pool.execute(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [user_id, store_id, rating]
      );
      res.status(201).json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;