const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');

exports.getAvailability = async (req, res) => {
  try {
    let availability = await Availability.findOne({ lawyer: req.lawyer.id });
    
    if (!availability) {
      availability = await Availability.create({ lawyer: req.lawyer.id });
    }
    
    res.status(200).json({ success: true, availability });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching availability', error: error.message });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { weeklySchedule, defaultSlotDuration, bufferTime } = req.body;
    
    const availability = await Availability.findOneAndUpdate(
      { lawyer: req.lawyer.id },
      { weeklySchedule, defaultSlotDuration, bufferTime },
      { new: true, upsert: true }
    );
    
    res.status(200).json({ success: true, message: 'Availability updated successfully', availability });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating availability', error: error.message });
  }
};

exports.addException = async (req, res) => {
  try {
    const { date, isAvailable, reason, slots } = req.body;
    
    const availability = await Availability.findOne({ lawyer: req.lawyer.id });
    
    availability.exceptions.push({ date, isAvailable, reason, slots });
    await availability.save();
    
    res.status(201).json({ success: true, message: 'Exception added successfully', availability });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding exception', error: error.message });
  }
};

exports.removeException = async (req, res) => {
  try {
    const availability = await Availability.findOne({ lawyer: req.lawyer.id });
    
    availability.exceptions.id(req.params.exceptionId).remove();
    await availability.save();
    
    res.status(200).json({ success: true, message: 'Exception removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing exception', error: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ success: false, message: 'Please provide a date' });
    }
    
    const availability = await Availability.findOne({ lawyer: req.params.lawyerId });
    
    if (!availability) {
      return res.status(404).json({ success: false, message: 'Availability not found' });
    }
    
    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Get day schedule
    let slots = [];
    const exception = availability.exceptions.find(exc => 
      exc.date.toDateString() === requestedDate.toDateString()
    );
    
    if (exception) {
      slots = exception.isAvailable ? exception.slots : [];
    } else {
      const daySchedule = availability.weeklySchedule[dayName];
      slots = daySchedule && daySchedule.isAvailable ? daySchedule.slots : [];
    }
    
    // Get existing appointments for that date
    const existingAppointments = await Appointment.find({
      lawyer: req.params.lawyerId,
      appointmentDate: {
        $gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
        $lt: new Date(requestedDate.setHours(23, 59, 59, 999))
      },
      status: { $in: ['pending', 'confirmed'] }
    });
    
    // Filter out booked slots
    const bookedTimes = existingAppointments.map(apt => apt.appointmentTime);
    const availableSlots = slots.filter(slot => 
      !bookedTimes.includes(slot.startTime)
    );
    
    res.status(200).json({ success: true, availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching available slots', error: error.message });
  }
};

exports.checkAvailability = async (req, res) => {
  try {
    const { date, time } = req.query;
    
    const availability = await Availability.findOne({ lawyer: req.params.lawyerId });
    
    if (!availability) {
      return res.status(200).json({ success: true, isAvailable: false });
    }
    
    const requestedDate = new Date(date);
    const isAvailable = availability.isAvailableAt(requestedDate, time);
    
    res.status(200).json({ success: true, isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking availability', error: error.message });
  }
};
