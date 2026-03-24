const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['internet', 'furniture', 'electricity', 'water', 'cleanliness'],
    required: true
  },
  subcategory: { type: String },
  description: { type: String, required: true },
  image: { type: String },
  roomNumber: { type: String },
  hostelName: { type: String },
  floorNumber: { type: String },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', complaintSchema);