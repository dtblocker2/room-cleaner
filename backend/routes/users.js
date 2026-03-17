const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, roomNumber, hostelBlock, phone } = req.body;
    if (email && email !== req.user.email) {
      if (await User.findOne({ email })) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }
    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    if (roomNumber !== undefined) user.roomNumber = roomNumber;
    if (hostelBlock !== undefined) user.hostelBlock = hostelBlock;
    if (phone !== undefined) user.phone = phone;
    await user.save();

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role,
        roomNumber: user.roomNumber, hostelBlock: user.hostelBlock, phone: user.phone }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;