const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// Get all notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { targetUsers: { $size: 0 } },
        { targetUsers: req.user._id }
      ]
    }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a notification (Admin only ideally, but keeping simple for now)
router.post('/', protect, async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
