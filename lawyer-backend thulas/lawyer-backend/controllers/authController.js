const Lawyer = require('../models/Lawyer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validateEmail, validatePhone, validatePassword } = require('../utils/validators');
// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register a new lawyer
// @route   POST /api/auth/register
// @access  Public
exports.registerLawyer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      barCouncilId,
      licenseNumber,
      yearsOfExperience,
      specializations,
      languagesSpoken,
      district,
      city,
      consultationFee
    } = req.body;

    // Check if lawyer already exists
    const existingLawyer = await Lawyer.findOne({ 
      $or: [{ email }, { barCouncilId }, { licenseNumber }] 
    });

    if (existingLawyer) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer with this email, Bar Council ID, or License Number already exists'
      });
    }

    // Create lawyer
    const lawyer = await Lawyer.create({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      dateOfBirth,
      gender,
      barCouncilId,
      licenseNumber,
      yearsOfExperience,
      specializations,
      languagesSpoken,
      district,
      city,
      consultationFee,
      verificationStatus: 'pending'
    });

    // Generate token
    const token = generateToken(lawyer._id);

    res.status(201).json({
      success: true,
      message: 'Lawyer registered successfully. Please submit verification documents.',
      token,
      lawyer: lawyer.getPublicProfile()
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering lawyer',
      error: error.message
    });
  }
};

// @desc    Login lawyer
// @route   POST /api/auth/login
// @access  Public
exports.loginLawyer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for lawyer (including password field)
    const lawyer = await Lawyer.findOne({ email }).select('+password');

    if (!lawyer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!lawyer.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordMatch = await lawyer.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    lawyer.lastLogin = Date.now();
    await lawyer.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(lawyer._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      lawyer: lawyer.getPublicProfile()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current logged in lawyer
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.lawyer.id);

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.status(200).json({
      success: true,
      lawyer: lawyer.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lawyer data',
      error: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const lawyer = await Lawyer.findById(req.lawyer.id).select('+password');

    // Check current password
    const isMatch = await lawyer.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    lawyer.password = newPassword;
    await lawyer.save();

    const token = generateToken(lawyer._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const lawyer = await Lawyer.findOne({ email });

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'No lawyer found with this email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    lawyer.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    lawyer.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await lawyer.save({ validateBeforeSave: false });

    // In production, send email with reset link
    // For now, just return the token
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to email',
      resetUrl // Remove this in production
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const lawyer = await Lawyer.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!lawyer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    lawyer.password = newPassword;
    lawyer.resetPasswordToken = undefined;
    lawyer.resetPasswordExpire = undefined;
    await lawyer.save();

    const token = generateToken(lawyer._id);

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// @desc    Logout lawyer
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};
