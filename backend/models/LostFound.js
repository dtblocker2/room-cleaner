const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  location: { type: String, required: true },
  collectFrom: { type: String },
  status: { type: String, enum: ['open', 'claimed', 'closed'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostFound', lostFoundSchema);