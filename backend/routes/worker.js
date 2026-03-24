const express = require('express');
const Complaint = require('../models/Complaint');
const CleaningRequest = require('../models/CleaningRequest');
const LaundryRequest = require('../models/LaundryRequest');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// Get assigned tasks
router.get('/tasks', auth, authorize('worker'), async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedWorker: req.user._id,
      status: { $in: ['pending', 'in-progress'] }
    })
      .populate('userId', 'name roomNumber hostelName')
      .sort({ createdAt: -1 });

    const cleaningTasks = await CleaningRequest.find({
      $or: [
        { workerId: req.user._id },
        { status: 'pending' }
      ],
      status: { $ne: 'completed' }
    })
      .populate('studentId', 'name roomNumber hostelName')
      .sort({ createdAt: -1 });

    const laundryTasks = await LaundryRequest.find({
      $or: [
        { workerId: req.user._id },
        { status: 'pending' }
      ],
      status: { $ne: 'completed' }
    })
      .populate('studentId', 'name roomNumber hostelName')
      .sort({ submittedAt: -1 });

    res.json({ complaints, cleaningTasks, laundryTasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status
router.put('/tasks/:id', auth, authorize('worker'), async (req, res) => {
  try {
    const { status, taskType } = req.body;

    if (taskType === 'complaint') {
      const complaint = await Complaint.findByIdAndUpdate(
        req.params.id,
        { status, updatedAt: Date.now() },
        { new: true }
      ).populate('userId', 'name');

      if (complaint) {
        await Notification.create({
          userId: complaint.userId._id || complaint.userId,
          message: `Your ${complaint.category} complaint is now ${status}`,
          type: 'complaint_update',
          relatedId: complaint._id
        });
      }
      return res.json(complaint);
    }

    res.json({ message: 'Task updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Worker stats
router.get('/stats', auth, authorize('worker'), async (req, res) => {
  try {
    const assignedComplaints = await Complaint.countDocuments({ assignedWorker: req.user._id });
    const completedComplaints = await Complaint.countDocuments({ assignedWorker: req.user._id, status: 'resolved' });
    const pendingCleaning = await CleaningRequest.countDocuments({ workerId: req.user._id, status: { $ne: 'completed' } });
    const completedCleaning = await CleaningRequest.countDocuments({ workerId: req.user._id, status: 'completed' });

    res.json({ assignedComplaints, completedComplaints, pendingCleaning, completedCleaning });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;