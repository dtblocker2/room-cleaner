const express = require('express');
const CleaningRequest = require('../models/CleaningRequest');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get cleaning requests
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.studentId = req.user._id;
    if (req.user.role === 'worker') query.status = { $in: ['pending', 'accepted'] };

    const requests = await CleaningRequest.find(query)
      .populate('studentId', 'name roomNumber hostelName')
      .populate('workerId', 'name workerId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create cleaning request
router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const { requestedTimeSlot } = req.body;
    const request = new CleaningRequest({
      studentId: req.user._id,
      roomNumber: req.user.roomNumber,
      hostelName: req.user.hostelName,
      requestedTimeSlot
    });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept/complete cleaning (worker)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'accepted') update.workerId = req.user._id;
    if (status === 'completed') update.cleanedAt = Date.now();

    const request = await CleaningRequest.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('studentId', 'name roomNumber hostelName')
      .populate('workerId', 'name workerId');

    if (request) {
      await Notification.create({
        userId: request.studentId._id || request.studentId,
        message: `Room cleaning ${status}`,
        type: 'cleaning_update',
        relatedId: request._id
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Rate cleaning
router.put('/:id/rate', auth, authorize('student'), async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const request = await CleaningRequest.findByIdAndUpdate(
      req.params.id,
      { rating, feedback },
      { new: true }
    );
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;