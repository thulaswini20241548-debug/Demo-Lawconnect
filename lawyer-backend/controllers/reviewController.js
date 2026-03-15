const Review = require('../models/Review');

exports.getLawyerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      lawyer: req.params.lawyerId, 
      isVisible: true 
    })
    .populate('client', 'firstName lastName')
    .sort('-createdAt')
    .limit(50);
    
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ lawyer: req.lawyer.id })
      .populate('client', 'firstName lastName')
      .sort('-createdAt');
    
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews', error: error.message });
  }
};

exports.respondToReview = async (req, res) => {
  try {
    const { response } = req.body;
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (review.lawyer.toString() !== req.lawyer.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    review.lawyerResponse = {
      response,
      respondedAt: Date.now()
    };
    
    await review.save();
    res.status(200).json({ success: true, message: 'Response added successfully', review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error responding to review', error: error.message });
  }
};

exports.markAsHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    
    res.status(200).json({ success: true, helpfulCount: review.helpfulCount });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking as helpful', error: error.message });
  }
};

exports.getReviewStats = async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { lawyer: req.params.lawyerId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          avgProfessionalism: { $avg: '$aspects.professionalism' },
          avgCommunication: { $avg: '$aspects.communication' },
          avgExpertise: { $avg: '$aspects.expertise' },
          avgResponsiveness: { $avg: '$aspects.responsiveness' }
        }
      }
    ]);
    
    res.status(200).json({ success: true, stats: stats[0] || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching review stats', error: error.message });
  }
};
