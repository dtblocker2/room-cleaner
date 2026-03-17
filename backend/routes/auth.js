const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const userResponse = (user) => ({
  id: user._id, name: user.name, email: user.email,
  role: user.role, roomNumber: user.roomNumber,
  hostelBlock: user.hostelBlock, phone: user.phone
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, roomNumber, hostelBlock, phone, staffCode } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    let role = 'student';
    if (staffCode) {
      if (staffCode !== process.env.STAFF_CODE) {
        return res.status(400).json({ message: 'Invalid staff registration code' });
      }
      role = 'staff';
    }

    const user = await User.create({ name, email, password, role, roomNumber, hostelBlock, phone });
    res.status(201).json({ token: generateToken(user._id), user: userResponse(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    res.json({ token: generateToken(user._id), user: userResponse(user) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, (req, res) => {
  res.json({ user: userResponse(req.user) });
});

module.exports = router;