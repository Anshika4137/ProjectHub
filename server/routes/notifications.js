const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ msg: 'Unable to fetch notifications' });
  }
});

router.delete('/', auth, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ msg: 'Notifications cleared' });
  } catch (err) {
    res.status(500).json({ msg: 'Unable to clear notifications' });
  }
});

module.exports = router;
