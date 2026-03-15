const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: true,
    unique: true
  },
  weeklySchedule: {
    monday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String
      }]
    },
    tuesday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String
      }]
    },
    wednesday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String
      }]
    },
    thursday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String
      }]
    },
    friday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String
      }]
    },
    saturday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String
      }]
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      slots: [{
        startTime: String,
        endTime: String
      }]
    }
  },
  exceptions: [{
    date: {
      type: Date,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: false
    },
    reason: String,
    slots: [{
      startTime: String,
      endTime: String
    }]
  }],
  defaultSlotDuration: {
    type: Number,
    default: 60 // in minutes
  },
  bufferTime: {
    type: Number,
    default: 15 // buffer between appointments in minutes
  },
  advanceBookingDays: {
    type: Number,
    default: 30 // how many days in advance clients can book
  },
  minimumNoticeHours: {
    type: Number,
    default: 24 // minimum hours notice required for booking
  }
}, {
  timestamps: true
});

// Method to check if lawyer is available on a specific date and time
availabilitySchema.methods.isAvailableAt = function(date, time) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySchedule = this.weeklySchedule[dayName];
  
  if (!daySchedule || !daySchedule.isAvailable) {
    return false;
  }
  
  // Check for exceptions
  const exception = this.exceptions.find(exc => 
    exc.date.toDateString() === date.toDateString()
  );
  
  if (exception) {
    if (!exception.isAvailable) {
      return false;
    }
    // Check exception slots
    return exception.slots.some(slot => 
      time >= slot.startTime && time < slot.endTime
    );
  }
  
  // Check regular weekly schedule
  return daySchedule.slots.some(slot => 
    time >= slot.startTime && time < slot.endTime
  );
};

module.exports = mongoose.model('Availability', availabilitySchema);
