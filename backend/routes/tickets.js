const express = require('express');
const Ticket = require('../models/Ticket');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Create ticket
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user.roomNumber) {
      return res.status(400).json({ message: 'Set your room number in Settings first' });
    }
    const { date, timeFrom, timeTo, priority, description } = req.body;
    const ticket = await Ticket.create({
      student: req.user._id, roomNumber: req.user.roomNumber,
      hostelBlock: req.user.hostelBlock, date, timeFrom, timeTo,
      priority: priority || 'medium', description
    });
    await ticket.populate('student', 'name email roomNumber hostelBlock phone');
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get tickets
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .populate('student', 'name email roomNumber hostelBlock phone')
      .populate('assignedTo', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Stats
router.get('/stats', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user._id;

    const [total, pending, accepted, completed, verified] = await Promise.all([
      Ticket.countDocuments(query),
      Ticket.countDocuments({ ...query, status: 'pending' }),
      Ticket.countDocuments({ ...query, status: 'accepted' }),
      Ticket.countDocuments({ ...query, status: 'completed' }),
      Ticket.countDocuments({ ...query, status: 'verified' })
    ]);

    let avgRating = null;
    if (req.user.role === 'staff') {
      const result = await Ticket.aggregate([
        { $match: { assignedTo: req.user._id, rating: { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]);
      avgRating = result.length ? Math.round(result[0].avg * 10) / 10 : null;
    }

    res.json({ total, pending, accepted, completed, verified, avgRating });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single ticket
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('student', 'name email roomNumber hostelBlock phone')
      .populate('assignedTo', 'name email phone');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role === 'student' && ticket.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept ticket (staff)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    if (req.user.role !== 'staff') return res.status(403).json({ message: 'Staff only' });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (ticket.status !== 'pending') return res.status(400).json({ message: 'Not pending' });

    ticket.status = 'accepted';
    ticket.assignedTo = req.user._id;
    await ticket.save();
    await ticket.populate('student', 'name email roomNumber hostelBlock phone');
    await ticket.populate('assignedTo', 'name email phone');
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete ticket (staff)
router.put('/:id/complete', auth, async (req, res) => {
  try {
    if (req.user.role !== 'staff') return res.status(403).json({ message: 'Staff only' });
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (ticket.status !== 'accepted') return res.status(400).json({ message: 'Not accepted yet' });
    if (ticket.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not assigned to you' });
    }

    ticket.status = 'completed';
    ticket.completedAt = new Date();
    ticket.staffNotes = req.body.staffNotes || '';
    await ticket.save();
    await ticket.populate('student', 'name email roomNumber hostelBlock phone');
    await ticket.populate('assignedTo', 'name email phone');
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify ticket (student)
router.put('/:id/verify', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (ticket.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your ticket' });
    }
    if (ticket.status !== 'completed') return res.status(400).json({ message: 'Not completed yet' });

    ticket.status = 'verified';
    ticket.verifiedAt = new Date();
    ticket.rating = req.body.rating || null;
    ticket.feedback = req.body.feedback || '';
    await ticket.save();
    await ticket.populate('student', 'name email roomNumber hostelBlock phone');
    await ticket.populate('assignedTo', 'name email phone');
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject ticket (student — resets to pending)
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (ticket.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your ticket' });
    }
    if (ticket.status !== 'completed') return res.status(400).json({ message: 'Not completed yet' });

    ticket.status = 'pending';
    ticket.assignedTo = null;
    ticket.completedAt = null;
    ticket.feedback = req.body.feedback || 'Cleaning was not satisfactory';
    await ticket.save();
    await ticket.populate('student', 'name email roomNumber hostelBlock phone');
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete ticket (student, pending only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'student' && ticket.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your ticket' });
    }
    if (ticket.status !== 'pending') {
      return res.status(400).json({ message: 'Can only cancel pending tickets' });
    }
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;