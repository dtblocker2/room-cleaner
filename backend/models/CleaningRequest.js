const mongoose = require('mongoose');

const cleaningRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomNumber: { type: String, required: true },
  hostelName: { type: String, required: true },
  requestedTimeSlot: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'completed'], default: 'pending' },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cleanedAt: { type: Date },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CleaningRequest', cleaningRequestSchema);