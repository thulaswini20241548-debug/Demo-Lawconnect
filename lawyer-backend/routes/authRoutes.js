const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new lawyer
// @access  Public
router.post('/register', authController.registerLawyer);

// @route   POST /api/auth/login
// @desc    Login lawyer
// @access  Public
router.post('/login', authController.loginLawyer);

// @route   GET /api/auth/me
// @desc    Get current logged in lawyer
// @access  Private
router.get('/me', protect, authController.getMe);

// @route   PUT /api/auth/updatepassword
// @desc    Update password
// @access  Private
router.put('/updatepassword', protect, authController.updatePassword);

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', authController.forgotPassword);

// @route   PUT /api/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resettoken', authController.resetPassword);

// @route   POST /api/auth/logout
// @desc    Logout lawyer
// @access  Private
router.post('/logout', protect, authController.logout);

module.exports = router;
