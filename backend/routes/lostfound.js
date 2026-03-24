const express = require('express');
const LostFound = require('../models/LostFound');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.query.type) query.type = req.query.type;
    if (req.query.status) query.status = req.query.status;

    const items = await LostFound.find(query)
      .populate('postedBy', 'name roomNumber hostelName')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { type, title, description, location, collectFrom } = req.body;
    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const item = new LostFound({
      postedBy: req.user._id, type, title, description, images, location, collectFrom
    });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const item = await LostFound.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;