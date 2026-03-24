const express = require('express');
const MessFeedback = require('../models/MessFeedback');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.studentId = req.user._id;
    if (req.query.mealType) query.mealType = req.query.mealType;

    const feedbacks = await MessFeedback.find(query)
      .populate('studentId', 'name roomNumber')
      .sort({ date: -1 })
      .limit(50);
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorize('student'), upload.single('image'), async (req, res) => {
  try {
    const { mealType, rating, feedback } = req.body;
    const fb = new MessFeedback({
      studentId: req.user._id,
      mealType,
      rating: Number(rating),
      feedback,
      image: req.file ? `/uploads/${req.file.filename}` : undefined
    });
    await fb.save();
    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get averages
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await MessFeedback.aggregate([
      { $group: { _id: '$mealType', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;