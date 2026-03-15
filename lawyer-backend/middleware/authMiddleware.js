const jwt = require('jsonwebtoken');
const Lawyer = require('../models/Lawyer');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get lawyer from token
      req.lawyer = await Lawyer.findById(decoded.id);

      if (!req.lawyer) {
        return res.status(401).json({
          success: false,
          message: 'Lawyer not found'
        });
      }

      // Check if account is active
      if (!req.lawyer.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated'
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.lawyer.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.lawyer.role} is not authorized to access this route`
      });
    }
    next();
  };
};
