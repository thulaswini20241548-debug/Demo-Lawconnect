const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required']
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required']
  },
  duration: {
    type: Number,
    default: 60, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending'
  },
  appointmentType: {
    type: String,
    enum: ['online', 'in-person'],
    required: true
  },
  caseCategory: {
    type: String,
    enum: [
      'Family Law',
      'Property Rights',
      'Employment Law',
      'Consumer Protection',
      'Criminal Law',
      'Corporate Law',
      'Other'
    ],
    required: true
  },
  caseDescription: {
    type: String,
    required: [true, 'Case description is required'],
    maxlength: 2000
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  meetingLink: {
    type: String // For online appointments
  },
  location: {
    type: String // For in-person appointments
  },
  consultationFee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'cash']
  },
  notes: {
    lawyerNotes: String,
    clientNotes: String
  },
  cancelReason: String,
  cancelledBy: {
    type: String,
    enum: ['client', 'lawyer', 'admin']
  },
  cancelledAt: Date,
  completedAt: Date,
  reminderSent: {
    type: Boolean,
    default: false
  },
  followUpRequired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
appointmentSchema.index({ lawyer: 1, appointmentDate: 1 });
appointmentSchema.index({ client: 1, status: 1 });

// Virtual for appointment end time
appointmentSchema.virtual('appointmentEndTime').get(function() {
  const [hours, minutes] = this.appointmentTime.split(':');
  const startTime = new Date(this.appointmentDate);
  startTime.setHours(parseInt(hours), parseInt(minutes));
  const endTime = new Date(startTime.getTime() + this.duration * 60000);
  return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
});

module.exports = mongoose.model('Appointment', appointmentSchema);
