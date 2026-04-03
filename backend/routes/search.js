/* ── routes/search.js ────────────────────────────── */
const express  = require('express');
const { Product } = require('../models/Product');
const scraperService = require('../services/scraperService');

const router = express.Router();
const PAGE_SIZE = 12;

/**
 * GET /api/search/suggestions
 * Returns fast prefix matches for autocomplete
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json([]);

    const query = q.trim();
    // Search by name prefix or brand
    const suggestions = await Product.find({
      $or: [
        { name: { $regex: new RegExp('^' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
        { brand: { $regex: new RegExp('^' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
      ]
    })
    .limit(8)
    .select('name image category bestPrice')
    .lean();

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: 'Suggestions failed.' });
  }
});

/**
 * GET /api/search
 * Main search engine rebuilt from scratch
 */
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, category, sortBy } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ message: 'Query too short.' });

    const query = q.trim();
    const pageNum = Math.max(1, parseInt(page));
    const skip = (pageNum - 1) * PAGE_SIZE;

    // 1. Build MongoDB Query
    let dbQuery = { $text: { $search: query } };
    
    // If text search is unavailable or returns nothing, fallback to regex
    let totalCount = await Product.countDocuments(dbQuery);
    if (totalCount === 0) {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      dbQuery = { name: { $regex: regex } };
      totalCount = await Product.countDocuments(dbQuery);
    }

    // 2. Sorting
    let sortOption = { score: { $meta: "textScore" } };
    if (sortBy === 'price-low') sortOption = { bestPrice: 1 };
    if (sortBy === 'price-high') sortOption = { bestPrice: -1 };
    if (sortBy === 'newest') sortOption = { createdAt: -1 };

    // 3. Execution
    const products = await Product.find(dbQuery)
      .sort(sortOption)
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean();

    // 4. Format for "Scratch" Search Requirements
    const results = products.map(p => {
      // Prioritize primary marketplace links
      const marketplaceLinks = {
        amazon: p.prices?.find(s => s.store.toLowerCase().includes('amazon'))?.url || `https://www.amazon.in/s?k=${encodeURIComponent(p.name)}`,
        flipkart: p.prices?.find(s => s.store.toLowerCase().includes('flipkart'))?.url || `https://www.flipkart.com/search?q=${encodeURIComponent(p.name)}`,
        reliance: p.prices?.find(s => s.store.toLowerCase().includes('reliance'))?.url || `https://www.reliancedigital.in/search?q=${encodeURIComponent(p.name)}`,
        croma: p.prices?.find(s => s.store.toLowerCase().includes('croma'))?.url || `https://www.croma.com/search?q=${encodeURIComponent(p.name)}`
      };

      return {
        id: p._id,
        name: p.name,
        brand: p.brand,
        image: p.image,
        description: p.description,
        category: p.category,
        bestPrice: p.bestPrice || 0,
        bestStore: p.bestStore || 'Marketplace',
        rating: p.rating || '4.5',
        reviews: p.reviews || 0,
        marketplaceLinks,
        specs: p.specs || {}
      };
    });

    res.json({
      results,
      totalCount,
      page: pageNum,
      hasMore: totalCount > pageNum * PAGE_SIZE,
      query
    });

  } catch (err) {
    console.error('[Search API Error]:', err);
    res.status(500).json({ message: 'Search engine encountered an error.' });
  }
});

module.exports = router;
