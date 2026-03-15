const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  review: {
    type: String,
    required: [true, 'Review text is required'],
    maxlength: 1000
  },
  aspects: {
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    expertise: {
      type: Number,
      min: 1,
      max: 5
    },
    responsiveness: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  lawyerResponse: {
    response: String,
    respondedAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews for same appointment
reviewSchema.index({ appointment: 1 }, { unique: true });
reviewSchema.index({ lawyer: 1, createdAt: -1 });

// Update lawyer's average rating after review
reviewSchema.post('save', async function() {
  const Lawyer = mongoose.model('Lawyer');
  
  const stats = await this.constructor.aggregate([
    { $match: { lawyer: this.lawyer } },
    {
      $group: {
        _id: '$lawyer',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    await Lawyer.findByIdAndUpdate(this.lawyer, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
