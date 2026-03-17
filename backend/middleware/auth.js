const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token expired or invalid' });
  }
};

const staffOnly = (req, res, next) => {
  if (req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Staff access only' });
  }
  next();
};

module.exports = { auth, staffOnly };