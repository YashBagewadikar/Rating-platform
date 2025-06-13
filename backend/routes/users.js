import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { search, role, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    let query = `
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             CASE WHEN u.role = 'store_owner' THEN COALESCE(AVG(r.rating), 0) ELSE NULL END as rating
      FROM users u
      LEFT JOIN ratings r ON u.store_id = r.store_id
      WHERE 1=1
    `;
    
    const params = [];

    if (search) {
      query += ` AND (u.name LIKE ? OR u.email LIKE ? OR u.address LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role) {
      query += ` AND u.role = ?`;
      params.push(role);
    }

    query += ` GROUP BY u.id ORDER BY u.${sortBy} ${sortOrder}`;

    const [users] = await pool.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create user (admin only)
router.post('/', authenticateToken, requireRole(['admin']), [
  body('name').isLength({ min: 20, max: 60 }).withMessage('Name must be between 20-60 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters')
    .matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter and one special character'),
  body('address').isLength({ max: 400 }).withMessage('Address must not exceed 400 characters'),
  body('role').isIn(['admin', 'user', 'store_owner']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, address, role } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user details
router.get('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
             CASE WHEN u.role = 'store_owner' THEN COALESCE(AVG(r.rating), 0) ELSE NULL END as rating
      FROM users u
      LEFT JOIN ratings r ON u.store_id = r.store_id
      WHERE u.id = ?
      GROUP BY u.id
    `, [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;