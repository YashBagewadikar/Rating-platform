import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    // Get total users
    const [totalUsers] = await pool.execute(
      'SELECT COUNT(*) as count FROM users WHERE role != "admin"'
    );

    // Get total stores
    const [totalStores] = await pool.execute(
      'SELECT COUNT(*) as count FROM stores'
    );

    // Get total ratings
    const [totalRatings] = await pool.execute(
      'SELECT COUNT(*) as count FROM ratings'
    );

    // Get user role breakdown
    const [roleBreakdown] = await pool.execute(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);

    // Get recent activity
    const [recentRatings] = await pool.execute(`
      SELECT r.rating, r.created_at, u.name as user_name, s.name as store_name
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    res.json({
      total_users: totalUsers[0].count,
      total_stores: totalStores[0].count,
      total_ratings: totalRatings[0].count,
      role_breakdown: roleBreakdown,
      recent_ratings: recentRatings
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;