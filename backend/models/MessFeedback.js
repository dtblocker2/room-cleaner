const mongoose = require('mongoose');

const messFeedbackSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  feedback: { type: String },
  image: { type: String },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MessFeedback', messFeedbackSchema);