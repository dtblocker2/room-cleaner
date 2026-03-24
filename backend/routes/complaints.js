const express = require('express');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get complaints (filtered by user for students, all for admin)
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.userId = req.user._id;
    if (req.query.category) query.category = req.query.category;
    if (req.query.status) query.status = req.query.status;

    const complaints = await Complaint.find(query)
      .populate('userId', 'name roomNumber hostelName')
      .populate('assignedWorker', 'name workerId')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create complaint
router.post('/', auth, authorize('student'), upload.single('image'), async (req, res) => {
  try {
    const { category, subcategory, description, floorNumber } = req.body;
    const complaint = new Complaint({
      userId: req.user._id,
      category,
      subcategory,
      description,
      floorNumber,
      roomNumber: req.user.roomNumber,
      hostelName: req.user.hostelName,
      image: req.file ? `/uploads/${req.file.filename}` : undefined
    });
    await complaint.save();
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, resolution, assignedWorker } = req.body;
    const update = { updatedAt: Date.now() };
    if (status) update.status = status;
    if (resolution) update.resolution = resolution;
    if (assignedWorker) update.assignedWorker = assignedWorker;

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('userId', 'name roomNumber hostelName')
      .populate('assignedWorker', 'name workerId');

    // Notify student
    if (status && complaint) {
      await Notification.create({
        userId: complaint.userId._id || complaint.userId,
        message: `Your ${complaint.category} complaint status changed to ${status}`,
        type: 'complaint_update',
        relatedId: complaint._id
      });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name roomNumber hostelName')
      .populate('assignedWorker', 'name workerId');
    if (!complaint) return res.status(404).json({ message: 'Not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;