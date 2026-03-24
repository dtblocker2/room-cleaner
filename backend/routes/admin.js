const express = require('express');
const Complaint = require('../models/Complaint');
const CleaningRequest = require('../models/CleaningRequest');
const LaundryRequest = require('../models/LaundryRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Dashboard stats
router.get('/stats', auth, authorize('admin'), async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalCleaning = await CleaningRequest.countDocuments();
    const totalLaundry = await LaundryRequest.countDocuments();

    // Category breakdown
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Status breakdown
    const statusStats = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      totalComplaints, pendingComplaints, resolvedComplaints,
      totalStudents, totalWorkers, totalCleaning, totalLaundry,
      categoryStats, statusStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all complaints
router.get('/complaints', auth, authorize('admin'), async (req, res) => {
  try {
    const query = {};
    if (req.query.category) query.category = req.query.category;
    if (req.query.status) query.status = req.query.status;

    const complaints = await Complaint.find(query)
      .populate('userId', 'name roomNumber hostelName rollNumber')
      .populate('assignedWorker', 'name workerId')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all workers
router.get('/workers', auth, authorize('admin'), async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password');
    res.json(workers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign worker to complaint
router.put('/assign/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { workerId } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assignedWorker: workerId, status: 'in-progress', updatedAt: Date.now() },
      { new: true }
    ).populate('userId', 'name').populate('assignedWorker', 'name workerId');

    // Notify worker
    await Notification.create({
      userId: workerId,
      message: `New task assigned: ${complaint.category} - Room ${complaint.roomNumber}`,
      type: 'task_assigned',
      relatedId: complaint._id
    });

    // Notify student
    await Notification.create({
      userId: complaint.userId._id || complaint.userId,
      message: `Worker assigned to your ${complaint.category} complaint`,
      type: 'complaint_update',
      relatedId: complaint._id
    });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;