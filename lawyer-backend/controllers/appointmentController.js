const Appointment = require('../models/Appointment');
const Lawyer = require('../models/Lawyer');

// @desc    Get all appointments for logged in lawyer
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { lawyer: req.lawyer.id };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('client', 'firstName lastName email phoneNumber')
      .sort('-appointmentDate')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: appointments.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('client', 'firstName lastName email phoneNumber')
      .populate('lawyer', 'firstName lastName email phoneNumber');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if lawyer owns this appointment
    if (appointment.lawyer._id.toString() !== req.lawyer.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this appointment'
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment',
      error: error.message
    });
  }
};

// @desc    Confirm appointment
// @route   PUT /api/appointments/:id/confirm
// @access  Private
exports.confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.lawyer.toString() !== req.lawyer.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    appointment.status = 'confirmed';
    await appointment.save();

    // TODO: Send notification to client

    res.status(200).json({
      success: true,
      message: 'Appointment confirmed successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error confirming appointment',
      error: error.message
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.lawyer.toString() !== req.lawyer.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelReason = cancelReason;
    appointment.cancelledBy = 'lawyer';
    appointment.cancelledAt = Date.now();
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling appointment',
      error: error.message
    });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentDate, appointmentTime } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.lawyer.toString() !== req.lawyer.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    appointment.appointmentDate = appointmentDate;
    appointment.appointmentTime = appointmentTime;
    appointment.status = 'rescheduled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rescheduling appointment',
      error: error.message
    });
  }
};

// @desc    Mark appointment as completed
// @route   PUT /api/appointments/:id/complete
// @access  Private
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.lawyer.toString() !== req.lawyer.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    appointment.status = 'completed';
    appointment.completedAt = Date.now();
    await appointment.save();

    // Update lawyer statistics
    await Lawyer.findByIdAndUpdate(req.lawyer.id, {
      $inc: { totalCasesHandled: 1, totalAppointments: 1 }
    });

    res.status(200).json({
      success: true,
      message: 'Appointment completed successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing appointment',
      error: error.message
    });
  }
};

// @desc    Update lawyer notes
// @route   PUT /api/appointments/:id/notes
// @access  Private
exports.updateNotes = async (req, res) => {
  try {
    const { lawyerNotes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.lawyer.toString() !== req.lawyer.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    appointment.notes.lawyerNotes = lawyerNotes;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Notes updated successfully',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notes',
      error: error.message
    });
  }
};

// @desc    Upload appointment attachments
// @route   POST /api/appointments/:id/attachments
// @access  Private
exports.uploadAttachments = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one file'
      });
    }

    const attachments = req.files.map(file => ({
      fileName: file.originalname,
      fileUrl: file.path,
      uploadedAt: Date.now()
    }));

    appointment.attachments.push(...attachments);
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      attachments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading attachments',
      error: error.message
    });
  }
};

// @desc    Get upcoming appointments
// @route   GET /api/appointments/upcoming
// @access  Private
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      lawyer: req.lawyer.id,
      status: 'confirmed',
      appointmentDate: { $gte: new Date() }
    })
    .populate('client', 'firstName lastName')
    .sort('appointmentDate')
    .limit(10);

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming appointments',
      error: error.message
    });
  }
};

// @desc    Get today's appointments
// @route   GET /api/appointments/today
// @access  Private
exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      lawyer: req.lawyer.id,
      appointmentDate: {
        $gte: today,
        $lt: tomorrow
      }
    })
    .populate('client', 'firstName lastName phoneNumber')
    .sort('appointmentTime');

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s appointments',
      error: error.message
    });
  }
};

// @desc    Get appointment statistics
// @route   GET /api/appointments/stats
// @access  Private
exports.getAppointmentStats = async (req, res) => {
  try {
    const stats = await Appointment.aggregate([
      { $match: { lawyer: req.lawyer.id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching appointment stats',
      error: error.message
    });
  }
};
