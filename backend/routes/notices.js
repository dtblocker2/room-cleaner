const express = require('express');
const Notice = require('../models/Notice');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.targetAudience = { $in: ['students', 'all'] };
    } else if (req.user.role === 'worker') {
      query.targetAudience = { $in: ['workers', 'all'] };
    }

    const notices = await Notice.find(query)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { title, content, targetAudience } = req.body;
    const notice = new Notice({
      postedBy: req.user._id, title, content, targetAudience
    });
    await notice.save();

    // Notify target users
    let roleFilter = {};
    if (targetAudience === 'students') roleFilter.role = 'student';
    else if (targetAudience === 'workers') roleFilter.role = 'worker';

    const users = await User.find(roleFilter).select('_id');
    const notifications = users.map(u => ({
      userId: u._id,
      message: `New notice: ${title}`,
      type: 'notice',
      relatedId: notice._id
    }));
    if (notifications.length) await Notification.insertMany(notifications);

    res.status(201).json(notice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;