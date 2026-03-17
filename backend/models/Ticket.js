const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomNumber: { type: String, required: true },
  hostelBlock: { type: String, default: '' },
  date: { type: Date, required: true },
  timeFrom: { type: String, required: true },
  timeTo: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'verified', 'rejected'],
    default: 'pending'
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  rating: { type: Number, min: 1, max: 5, default: null },
  feedback: { type: String, default: '' },
  staffNotes: { type: String, default: '' },
  completedAt: { type: Date, default: null },
  verifiedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);