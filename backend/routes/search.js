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
 * Main search engine: Supports query 'q', 'category', 'sortBy', and 'page'
 */
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, category, sortBy } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const skip = (pageNum - 1) * PAGE_SIZE;

    let dbQuery = {};

    // 1. Build Query (Handle q, category, or both)
    if (q && q.trim().length >= 2) {
      const query = q.trim();
      dbQuery = { $text: { $search: query } };
      
      // Fallback to regex if text search yields nothing
      const tc = await Product.countDocuments(dbQuery);
      if (tc === 0) {
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        dbQuery = { name: { $regex: regex } };
      }
    }

    if (category && category !== 'all') {
      // Map category name to DB values if needed (e.g. 'phones' -> 'Smartphones')
      let catValue = category;
      if (category === 'phones') catValue = 'Smartphones';
      if (category === 'laptops') catValue = 'Laptops';
      dbQuery.category = catValue;
    }

    // 2. Sorting
    let sortOption = { createdAt: -1 }; // Default: Newest
    if (dbQuery.$text) sortOption = { score: { $meta: "textScore" } };
    if (sortBy === 'price-low') sortOption = { bestPrice: 1 };
    if (sortBy === 'price-high') sortOption = { bestPrice: -1 };

    // 3. Execution
    const products = await Product.find(dbQuery)
      .sort(sortOption)
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean();

    const totalCount = await Product.countDocuments(dbQuery);

    // 4. Formatting
    const results = products.map(p => {
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
        category: p.category,
        bestPrice: p.bestPrice || 0,
        bestStore: p.bestStore || 'Marketplace',
        rating: p.rating || '4.5',
        reviews: p.reviews || 0,
        marketplaceLinks
      };
    });

    res.json({
      results,
      totalCount,
      page: pageNum,
      hasMore: totalCount > pageNum * PAGE_SIZE,
      query: q || '',
      category: category || 'all'
    });

  } catch (err) {
    console.error('[Search API Error]:', err);
    res.status(500).json({ message: 'Search engine failed.' });
  }
});

module.exports = router;
