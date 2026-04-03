/* ===================================================
   DealBaazi — backend/routes/user.js
   Profile CRUD, tracked items, preferences
   =================================================== */

const express = require('express');
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const { Product } = require('../models/Product');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

/* ── GET /api/user/profile ──────────────────────── */
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -__v');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load profile.' });
  }
});

/* ── PUT /api/user/profile ──────────────────────── */
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, phone, city } = req.body;
    const allowed = {};
    if (firstName) allowed.firstName = firstName.trim();
    if (lastName !== undefined) allowed.lastName = lastName.trim();
    if (phone    !== undefined) allowed.phone    = phone.trim();
    if (city     !== undefined) allowed.city     = city.trim();

    const user = await User.findByIdAndUpdate(
      req.user.id, allowed, { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

/* ── PUT /api/user/change-password ─────────────── */
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields are required.' });
    if (newPassword.length < 8)
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });

    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword)))
      return res.status(401).json({ message: 'Current password is incorrect.' });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();
    res.json({ message: 'Password updated successfully.' });

  } catch (err) {
    res.status(500).json({ message: 'Failed to change password.' });
  }
});

/* ── PUT /api/user/preferences ─────────────────── */
router.put('/preferences', async (req, res) => {
  try {
    const prefs = req.body; // { price: true, weekly: false, flash: true }
    await User.findByIdAndUpdate(req.user.id, { $set: { preferences: prefs } });
    res.json({ message: 'Preferences saved.' });
  } catch {
    res.status(500).json({ message: 'Failed to save preferences.' });
  }
});

/* ── GET /api/user/tracked ──────────────────────── */
router.get('/tracked', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('trackedItems');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const ids = user.trackedItems || [];
    if (!ids.length) return res.json([]);

    const products = await Product.find({ _id: { $in: ids } })
      .select('name image bestPrice bestStore lowestEver priceHistory currentPrice prices')
      .lean();

    const result = products.map(p => ({
      id:           p._id,
      name:         p.name,
      image:        p.image,
      bestStore:    p.bestStore,
      currentPrice: p.bestPrice,
      lowestEver:   p.lowestEver,
      priceHistory: (p.priceHistory || []).slice(-30)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load tracked items.' });
  }
});

/* ── POST /api/user/tracked/:productId ──────────── */
router.post('/tracked/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { trackedItems: productId }
    });
    res.json({ message: 'Now tracking this product.' });
  } catch {
    res.status(500).json({ message: 'Failed to track product.' });
  }
});

/* ── DELETE /api/user/tracked/:productId ────────── */
router.delete('/tracked/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { trackedItems: productId }
    });
    res.json({ message: 'Removed from tracked items.' });
  } catch {
    res.status(500).json({ message: 'Failed to remove tracked item.' });
  }
});

/* ── DELETE /api/user/delete ────────────────────── */
router.delete('/delete', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted.' });
  } catch {
    res.status(500).json({ message: 'Failed to delete account.' });
  }
});

module.exports = router;
