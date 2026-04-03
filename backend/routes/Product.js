/* ── routes/Product.js ────────────────────────────── */
const express     = require('express');
const { Product } = require('../models/Product');
const { scrapeSpecsBySearch } = require('../services/specService');
const router      = express.Router();

/* GET /api/product/:id */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    // Fetch specs lazily if not cached yet (non-blocking — run in background)
    let specs = product.specs || {};
    if (!specs || Object.keys(specs).length === 0) {
      console.log(`[Product] No specs cached for "${product.name}", fetching live...`);
      // Run spec scrape in background so we don't block the response
      scrapeSpecsBySearch(product.name).then(freshSpecs => {
        if (freshSpecs && Object.keys(freshSpecs).length > 0) {
          Product.updateOne({ _id: product._id }, { $set: { specs: freshSpecs } }).catch(() => {});
          console.log(`[Product] Cached ${Object.keys(freshSpecs).length} specs for "${product.name}"`);
        }
      });
    }

    // Sort prices best (lowest) first
    const sortedPrices = (product.prices || [])
      .filter(p => p.price > 0)
      .sort((a, b) => a.price - b.price);

    const bestEntry = sortedPrices[0];

    res.json({
      id:           product._id,
      name:         product.name,
      brand:        product.brand || '',
      category:     product.category || '',
      image:        product.image || '',
      description:  product.description || '',
      specs:        product.specs || {},
      tags:         product.tags || [],
      prices:       sortedPrices,
      bestPrice:    bestEntry?.price || product.bestPrice || 0,
      bestStore:    bestEntry?.store || product.bestStore || '',
      lowestEver:   product.lowestEver || bestEntry?.price || 0,
      lowestEverDate: product.lowestEverDate || '',
      priceHistory: (product.priceHistory || []).slice(-30), // last 30 entries
      offers:       product.offers || [],
      lastScraped:  product.lastScraped,
    });

  } catch (err) {
    console.error('[Product] Detail error:', err.message);
    res.status(500).json({ message: 'Failed to load product details.' });
  }
});

module.exports = router;
