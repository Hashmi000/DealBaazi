/* ── routes/alerts.js ────────────────────────────── */
const express    = require('express');
const authMiddleware = require('../middleware/auth');
const { PriceAlert } = require('../models/Product');
const { Product }    = require('../models/Product');

const router = express.Router();
router.use(authMiddleware);

/* POST /api/alerts — Create alert */
router.post('/', async (req, res) => {
  try {
    const { productId, targetPrice } = req.body;
    if (!productId || !targetPrice)
      return res.status(400).json({ message: 'productId and targetPrice required.' });

    const product = await Product.findById(productId).lean();

    const alert = await PriceAlert.create({
      user: req.user.id,
      productId,
      productName: product?.name,
      targetPrice: Number(targetPrice),
      currentPrice: product?.bestPrice
    });

    res.status(201).json({ message: 'Alert created.', alert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create alert.' });
  }
});

/* GET /api/alerts — List user's alerts */
router.get('/', async (req, res) => {
  try {
    const alerts = await PriceAlert.find({ user: req.user.id, isActive: true })
      .sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load alerts.' });
  }
});

/* DELETE /api/alerts/:id */
router.delete('/:id', async (req, res) => {
  try {
    await PriceAlert.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isActive: false }
    );
    res.json({ message: 'Alert removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete alert.' });
  }
});

module.exports = router;
