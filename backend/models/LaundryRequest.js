const mongoose = require('mongoose');

const laundryRequestSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submittedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('LaundryRequest', laundryRequestSchema);