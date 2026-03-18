const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/reviews/lawyer/:lawyerId
// @desc    Get all reviews for a lawyer
// @access  Public
router.get('/lawyer/:lawyerId', reviewController.getLawyerReviews);

// @route   GET /api/reviews/my-reviews
// @desc    Get all reviews for logged in lawyer
// @access  Private (Lawyer only)
router.get('/my-reviews', protect, reviewController.getMyReviews);

// @route   POST /api/reviews/:reviewId/respond
// @desc    Respond to a review
// @access  Private (Lawyer only)
router.post('/:reviewId/respond', protect, reviewController.respondToReview);

// @route   PUT /api/reviews/:reviewId/helpful
// @desc    Mark review as helpful
// @access  Public
router.put('/:reviewId/helpful', reviewController.markAsHelpful);

// @route   GET /api/reviews/stats/:lawyerId
// @desc    Get review statistics for a lawyer
// @access  Public
router.get('/stats/:lawyerId', reviewController.getReviewStats);

module.exports = router;
