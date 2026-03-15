const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const lawyerSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  
  // Professional Information
  barCouncilId: {
    type: String,
    required: [true, 'Bar Association ID is required'],
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required'],
    unique: true
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0
  },
  specializations: [{
    type: String,
    enum: [
      'Family Law',
      'Property Rights',
      'Employment Law',
      'Consumer Protection',
      'Criminal Law',
      'Corporate Law',
      'Intellectual Property',
      'Tax Law',
      'Immigration Law',
      'Civil Litigation'
    ]
  }],
  languagesSpoken: [{
    type: String,
    enum: ['Sinhala', 'Tamil', 'English']
  }],
  
  // Location
  district: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  address: {
    street: String,
    postalCode: String
  },
  
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: {
    nic: String, // URL to NIC document
    supremeCourtId: String, // URL to Supreme Court ID
    barCouncilCertificate: String, // URL to Bar Council Certificate
    educationCertificates: [String] // URLs to education certificates
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Profile
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  
  // Pricing
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: 0
  },
  acceptsProBono: {
    type: Boolean,
    default: false
  },
  
  // Ratings and Reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  totalCasesHandled: {
    type: Number,
    default: 0
  },
  totalAppointments: {
    type: Number,
    default: 0
  },
  
  // Notifications
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: true
  },
  
  // Last Login
  lastLogin: Date,
  
  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date

}, {
  timestamps: true
});

// Hash password before saving
lawyerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
lawyerSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public profile
lawyerSchema.methods.getPublicProfile = function() {
  const lawyerObject = this.toObject();
  delete lawyerObject.password;
  delete lawyerObject.resetPasswordToken;
  delete lawyerObject.resetPasswordExpire;
  return lawyerObject;
};

module.exports = mongoose.model('Lawyer', lawyerSchema);
