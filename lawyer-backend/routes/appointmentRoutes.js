const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/appointments
// @desc    Get all appointments for logged in lawyer
// @access  Private (Lawyer only)
router.get('/', protect, appointmentController.getAppointments);

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, appointmentController.getAppointment);

// @route   PUT /api/appointments/:id/confirm
// @desc    Confirm appointment
// @access  Private (Lawyer only)
router.put('/:id/confirm', protect, appointmentController.confirmAppointment);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment
// @access  Private
router.put('/:id/cancel', protect, appointmentController.cancelAppointment);

// @route   PUT /api/appointments/:id/reschedule
// @desc    Reschedule appointment
// @access  Private
router.put('/:id/reschedule', protect, appointmentController.rescheduleAppointment);

// @route   PUT /api/appointments/:id/complete
// @desc    Mark appointment as completed
// @access  Private (Lawyer only)
router.put('/:id/complete', protect, appointmentController.completeAppointment);

// @route   PUT /api/appointments/:id/notes
// @desc    Add/update lawyer notes
// @access  Private (Lawyer only)
router.put('/:id/notes', protect, appointmentController.updateNotes);

// @route   POST /api/appointments/:id/attachments
// @desc    Upload appointment attachments
// @access  Private
router.post(
  '/:id/attachments',
  protect,
  upload.array('files', 5),
  appointmentController.uploadAttachments
);

// @route   GET /api/appointments/upcoming
// @desc    Get upcoming appointments
// @access  Private (Lawyer only)
router.get('/upcoming', protect, appointmentController.getUpcomingAppointments);

// @route   GET /api/appointments/today
// @desc    Get today's appointments
// @access  Private (Lawyer only)
router.get('/today', protect, appointmentController.getTodayAppointments);

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics
// @access  Private (Lawyer only)
router.get('/stats', protect, appointmentController.getAppointmentStats);

module.exports = router;
