/* ── routes/auth.js ──────────────────────────────── */
const express  = require('express');
const jwt      = require('jsonwebtoken');
const passport = require('passport');
const User     = require('../models/User');

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });

/* ── Register ──────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password)
      return res.status(400).json({ message: 'Please fill all required fields.' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: 'An account with this email already exists.' });

    const user = await User.create({ firstName, lastName, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, firstName: user.firstName, email: user.email }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

/* ── Login ─────────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Incorrect email or password.' });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, firstName: user.firstName, email: user.email }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

/* ── Google OAuth ──────────────────────────────── */
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}?error=auth` }),
  (req, res) => {
    const token = signToken(req.user._id);
    // Redirect with token in query (or set cookie)
    res.redirect(`${process.env.FRONTEND_URL}/pages/dashboard.html?token=${token}`);
  }
);

/* ── Get current user ──────────────────────────── */
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json({ id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email });
});

module.exports = router;
