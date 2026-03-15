const Lawyer = require('../models/Lawyer');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');

// @desc    Get all verified lawyers with filters
// @route   GET /api/lawyers
// @access  Public
exports.getLawyers = async (req, res) => {
  try {
    const {
      specialization,
      district,
      city,
      minFee,
      maxFee,
      rating,
      language,
      page = 1,
      limit = 10,
      sort = '-averageRating'
    } = req.query;

    // Build query
    const query = { verificationStatus: 'verified', isActive: true };

    if (specialization) {
      query.specializations = specialization;
    }
    if (district) {
      query.district = district;
    }
    if (city) {
      query.city = city;
    }
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }
    if (language) {
      query.languagesSpoken = language;
    }

    // Execute query with pagination
    const lawyers = await Lawyer.find(query)
      .select('-verificationDocuments')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Lawyer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: lawyers.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      lawyers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lawyers',
      error: error.message
    });
  }
};

// @desc    Get single lawyer by ID
// @route   GET /api/lawyers/:id
// @access  Public
exports.getLawyer = async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id)
      .select('-verificationDocuments -password');

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    // Get reviews count and rating breakdown
    const reviews = await Review.aggregate([
      { $match: { lawyer: lawyer._id } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingBreakdown = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };
    
    reviews.forEach(r => {
      ratingBreakdown[r._id] = r.count;
    });

    res.status(200).json({
      success: true,
      lawyer,
      ratingBreakdown
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching lawyer',
      error: error.message
    });
  }
};

// @desc    Update lawyer profile
// @route   PUT /api/lawyers/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = [
      'bio',
      'phoneNumber',
      'specializations',
      'languagesSpoken',
      'consultationFee',
      'acceptsProBono',
      'education',
      'district',
      'city',
      'address'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const lawyer = await Lawyer.findByIdAndUpdate(
      req.lawyer.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!lawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      lawyer: lawyer.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Update profile picture
// @route   PUT /api/lawyers/profile/picture
// @access  Private
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const lawyer = await Lawyer.findByIdAndUpdate(
      req.lawyer.id,
      { profilePicture: req.file.path },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: lawyer.profilePicture
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile picture',
      error: error.message
    });
  }
};

// @desc    Submit verification documents
// @route   POST /api/lawyers/verification/submit
// @access  Private
exports.submitVerificationDocuments = async (req, res) => {
  try {
    const verificationDocuments = {};

    if (req.files.nic) {
      verificationDocuments.nic = req.files.nic[0].path;
    }
    if (req.files.supremeCourtId) {
      verificationDocuments.supremeCourtId = req.files.supremeCourtId[0].path;
    }
    if (req.files.barCouncilCertificate) {
      verificationDocuments.barCouncilCertificate = req.files.barCouncilCertificate[0].path;
    }
    if (req.files.educationCertificates) {
      verificationDocuments.educationCertificates = req.files.educationCertificates.map(f => f.path);
    }

    const lawyer = await Lawyer.findByIdAndUpdate(
      req.lawyer.id,
      {
        verificationDocuments,
        verificationStatus: 'pending'
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Verification documents submitted successfully. Your application is under review.',
      lawyer: lawyer.getPublicProfile()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting verification documents',
      error: error.message
    });
  }
};

// @desc    Get lawyer dashboard statistics
// @route   GET /api/lawyers/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const lawyerId = req.lawyer.id;

    // Get appointment statistics
    const totalAppointments = await Appointment.countDocuments({ lawyer: lawyerId });
    const pendingAppointments = await Appointment.countDocuments({ 
      lawyer: lawyerId, 
      status: 'pending' 
    });
    const upcomingAppointments = await Appointment.countDocuments({
      lawyer: lawyerId,
      status: 'confirmed',
      appointmentDate: { $gte: new Date() }
    });
    const completedAppointments = await Appointment.countDocuments({
      lawyer: lawyerId,
      status: 'completed'
    });

    // Get revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenueData = await Appointment.aggregate([
      {
        $match: {
          lawyer: req.lawyer.id,
          status: 'completed',
          paymentStatus: 'paid',
          completedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$consultationFee' }
        }
      }
    ]);

    const revenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get recent reviews
    const recentReviews = await Review.find({ lawyer: lawyerId })
      .populate('client', 'firstName lastName')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments,
        pendingAppointments,
        upcomingAppointments,
        completedAppointments,
        monthlyRevenue: revenue,
        recentReviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// @desc    Search lawyers
// @route   GET /api/lawyers/search
// @access  Public
exports.searchLawyers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const lawyers = await Lawyer.find({
      verificationStatus: 'verified',
      isActive: true,
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { specializations: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { district: { $regex: q, $options: 'i' } }
      ]
    })
    .select('-verificationDocuments')
    .limit(20);

    res.status(200).json({
      success: true,
      count: lawyers.length,
      lawyers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching lawyers',
      error: error.message
    });
  }
};

// @desc    Update lawyer settings
// @route   PUT /api/lawyers/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { emailNotifications, smsNotifications, isAvailable } = req.body;

    const updates = {};
    if (emailNotifications !== undefined) updates.emailNotifications = emailNotifications;
    if (smsNotifications !== undefined) updates.smsNotifications = smsNotifications;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;

    const lawyer = await Lawyer.findByIdAndUpdate(
      req.lawyer.id,
      updates,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        emailNotifications: lawyer.emailNotifications,
        smsNotifications: lawyer.smsNotifications,
        isAvailable: lawyer.isAvailable
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};

// @desc    Deactivate lawyer account
// @route   DELETE /api/lawyers/account
// @access  Private
exports.deactivateAccount = async (req, res) => {
  try {
    await Lawyer.findByIdAndUpdate(req.lawyer.id, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating account',
      error: error.message
    });
  }
};
