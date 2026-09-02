const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const loginAttempts = new Map();
const loginRateLimit = (req, res, next) => {
  const key = req.ip;
  const now = Date.now();
  const attempt = loginAttempts.get(key) || { count: 0, startedAt: now };
  if (now - attempt.startedAt > 15 * 60 * 1000) Object.assign(attempt, { count: 0, startedAt: now });
  if (attempt.count >= 10) return res.status(429).json({ msg: 'Too many attempts. Please try again later.' });
  attempt.count += 1;
  loginAttempts.set(key, attempt);
  next();
};
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toPublicUser = (user) => ({ id: user._id, name: user.name, email: user.email, phone: user.phone || '' });

// Register
router.post('/register', async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;
  if (!name || name.length > 80 || !email || !emailPattern.test(email) || !password || password.length < 6) {
    return res.status(400).json({ msg: 'Enter a valid name, email, and password of at least 6 characters' });
  }
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login
router.post('/login', loginRateLimit, async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;
  if (!email || !password) return res.status(400).json({ msg: 'Invalid credentials' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


// Find user by email
router.get('/finduser', auth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.query.email }).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.put('/account', auth, async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const phone = req.body.phone?.trim() || '';
  if (!email || !emailPattern.test(email)) return res.status(400).json({ msg: 'Enter a valid email address' });
  if (phone.length > 30) return res.status(400).json({ msg: 'Phone number is too long' });

  try {
    const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (existing) return res.status(400).json({ msg: 'Email is already in use' });

    const user = await User.findByIdAndUpdate(req.user.id, { email, phone }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user: toPublicUser(user) });
  } catch (err) {
    res.status(500).json({ msg: 'Unable to update account' });
  }
});

router.put('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ msg: 'New password must be at least 6 characters' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (!await bcrypt.compare(currentPassword, user.password)) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Unable to update password' });
  }
});
module.exports = router;
