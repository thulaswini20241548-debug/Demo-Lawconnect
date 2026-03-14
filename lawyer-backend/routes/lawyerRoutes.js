const express = require('express');
const router = express.Router();
const lawyerController = require('../controllers/lawyerController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/lawyers
// @desc    Get all verified lawyers with filters
// @access  Public
router.get('/', lawyerController.getLawyers);

// @route   GET /api/lawyers/:id
// @desc    Get single lawyer by ID
// @access  Public
router.get('/:id', lawyerController.getLawyer);

// @route   PUT /api/lawyers/profile
// @desc    Update lawyer profile
// @access  Private (Lawyer only)
router.put('/profile', protect, lawyerController.updateProfile);

// @route   PUT /api/lawyers/profile/picture
// @desc    Update profile picture
// @access  Private (Lawyer only)
router.put(
  '/profile/picture',
  protect,
  upload.single('profilePicture'),
  lawyerController.updateProfilePicture
);

// @route   POST /api/lawyers/verification/submit
// @desc    Submit verification documents
// @access  Private (Lawyer only)
router.post(
  '/verification/submit',
  protect,
  upload.fields([
    { name: 'nic', maxCount: 1 },
    { name: 'supremeCourtId', maxCount: 1 },
    { name: 'barCouncilCertificate', maxCount: 1 },
    { name: 'educationCertificates', maxCount: 5 }
  ]),
  lawyerController.submitVerificationDocuments
);

// @route   GET /api/lawyers/dashboard/stats
// @desc    Get lawyer dashboard statistics
// @access  Private (Lawyer only)
router.get('/dashboard/stats', protect, lawyerController.getDashboardStats);

// @route   GET /api/lawyers/search
// @desc    Search lawyers by various criteria
// @access  Public
router.get('/search', lawyerController.searchLawyers);

// @route   PUT /api/lawyers/settings
// @desc    Update lawyer settings
// @access  Private (Lawyer only)
router.put('/settings', protect, lawyerController.updateSettings);

// @route   DELETE /api/lawyers/account
// @desc    Deactivate lawyer account
// @access  Private (Lawyer only)
router.delete('/account', protect, lawyerController.deactivateAccount);

module.exports = router;
