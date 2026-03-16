const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/* ── Helper: sign JWT ── */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/* ── Helper: send token response ── */
const sendToken = (res, statusCode, user, token) => {
  res.status(statusCode).json({
    token,
    user: {
      id:    user._id,
      email: user.email,
    },
  });
};

/**
 * POST /api/auth/signup
 * Register a new user with email + password.
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Basic validation */
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    /* Check if email already exists */
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    /* Create user (password hashed in pre-save hook) */
    const user  = await User.create({ email, password });
    const token = signToken(user._id);

    sendToken(res, 201, user, token);

  } catch (err) {
    /* Mongoose validation errors */
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return a JWT.
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    /* Find user (include password field which is select:false by default) */
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    sendToken(res, 200, user, token);

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated user's profile.
 * Requires a valid JWT in the Authorization header.
 */
router.get('/me', protect, (req, res) => {
  res.json({
    user: {
      id:        req.user._id,
      email:     req.user.email,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = router;
