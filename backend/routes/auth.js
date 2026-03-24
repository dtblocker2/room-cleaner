const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, rollNumber, hostelName, roomNumber, idNumber, workerId } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ message: 'Name, password and role are required' });
    }

    // Check duplicates
    if (role === 'student') {
      if (!email || !rollNumber || !hostelName || !roomNumber) {
        return res.status(400).json({ message: 'All student fields are required' });
      }
      const exists = await User.findOne({ $or: [{ email }, { rollNumber }] });
      if (exists) return res.status(400).json({ message: 'Student already exists' });
    } else if (role === 'admin') {
      if (!email || !idNumber) {
        return res.status(400).json({ message: 'All admin fields are required' });
      }
      const exists = await User.findOne({ $or: [{ email }, { idNumber }] });
      if (exists) return res.status(400).json({ message: 'Admin already exists' });
    } else if (role === 'worker') {
      if (!workerId) {
        return res.status(400).json({ message: 'Worker ID is required' });
      }
      const exists = await User.findOne({ workerId });
      if (exists) return res.status(400).json({ message: 'Worker already exists' });
    }

    const user = new User({ name, email, password, role, rollNumber, hostelName, roomNumber, idNumber, workerId });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role,
        rollNumber: user.rollNumber, hostelName: user.hostelName, roomNumber: user.roomNumber,
        workerId: user.workerId, idNumber: user.idNumber }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role, workerId } = req.body;

    let user;
    if (role === 'worker') {
      user = await User.findOne({ workerId, role: 'worker' });
    } else {
      user = await User.findOne({ email, role });
    }

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role,
        rollNumber: user.rollNumber, hostelName: user.hostelName, roomNumber: user.roomNumber,
        workerId: user.workerId, idNumber: user.idNumber }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;