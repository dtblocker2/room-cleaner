const express = require('express');
const LaundryRequest = require('../models/LaundryRequest');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.studentId = req.user._id;

    const requests = await LaundryRequest.find(query)
      .populate('studentId', 'name roomNumber hostelName')
      .populate('workerId', 'name workerId')
      .sort({ submittedAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorize('student'), async (req, res) => {
  try {
    const { items, quantity } = req.body;
    const request = new LaundryRequest({ studentId: req.user._id, items, quantity });
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'in-progress') update.workerId = req.user._id;
    if (status === 'completed') update.completedAt = Date.now();

    const request = await LaundryRequest.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('studentId', 'name roomNumber hostelName');

    if (request) {
      await Notification.create({
        userId: request.studentId._id || request.studentId,
        message: `Laundry status: ${status}`,
        type: 'laundry_update',
        relatedId: request._id
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;