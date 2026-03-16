const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect
 * Middleware that verifies the JWT from the Authorization header.
 * Attaches the authenticated user to req.user.
 * Rejects with 401 if token is missing, invalid, or expired.
 */
const protect = async (req, res, next) => {
  try {
    /* 1. Extract token from header */
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    /* 2. Verify token */
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ error: 'Invalid token. Please log in.' });
    }

    /* 3. Check user still exists in DB */
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    /* 4. Attach user to request */
    req.user = user;
    next();

  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { protect };
