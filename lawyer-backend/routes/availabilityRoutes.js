const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availabilityController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/availability
// @desc    Get availability for logged in lawyer
// @access  Private (Lawyer only)
router.get('/', protect, availabilityController.getAvailability);

// @route   PUT /api/availability
// @desc    Update weekly schedule
// @access  Private (Lawyer only)
router.put('/', protect, availabilityController.updateAvailability);

// @route   POST /api/availability/exception
// @desc    Add exception date (holiday, special hours)
// @access  Private (Lawyer only)
router.post('/exception', protect, availabilityController.addException);

// @route   DELETE /api/availability/exception/:exceptionId
// @desc    Remove exception date
// @access  Private (Lawyer only)
router.delete('/exception/:exceptionId', protect, availabilityController.removeException);

// @route   GET /api/availability/slots/:lawyerId
// @desc    Get available time slots for a lawyer on a specific date
// @access  Public
router.get('/slots/:lawyerId', availabilityController.getAvailableSlots);

// @route   GET /api/availability/check/:lawyerId
// @desc    Check if lawyer is available at specific date/time
// @access  Public
router.get('/check/:lawyerId', availabilityController.checkAvailability);

module.exports = router;
