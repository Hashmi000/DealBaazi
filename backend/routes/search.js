/* ── routes/search.js ────────────────────────────── */
const express  = require('express');
const { Product } = require('../models/Product');
const scraperService = require('../services/scraperService');

const router = express.Router();
const PAGE_SIZE = 12;

/* GET /api/search?q=iphone&page=1&sortBy=price-low&... */
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, category } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ message: 'Query too short.' });

    const query = q.trim();
    const pageNum = Math.max(1, parseInt(page));
    const skip = (pageNum - 1) * PAGE_SIZE;

    console.log(`[Search API] Query: "${query}" | Page: ${pageNum}`);
    
    // Fallback search: Try text search first, if fails use regex
    let products = [];
    let totalCount = 0;

    try {
      console.log('[Search API] Attempting $text search...');
      products = await Product.find({ $text: { $search: query } })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean();
      totalCount = await Product.countDocuments({ $text: { $search: query } });
      console.log(`[Search API] $text found ${products.length} items`);
    } catch (e) {
      console.warn('[Search API] $text search failed, falling back to regex:', e.message);
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      products = await Product.find({ name: { $regex: regex } })
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean();
      totalCount = await Product.countDocuments({ name: { $regex: regex } });
    }

    // 2. Trigger LIVE Scrape logic
    const isStale = products.length > 0 && products.some(p => !p.lastScraped || (Date.now() - new Date(p.lastScraped).getTime()) > 24 * 60 * 60 * 1000);
    
    if (pageNum === 1 && (products.length < 2 || isStale)) {
      console.log(`[Search API] Low or stale results (${products.length}), triggering scraper...`);
      try {
        const scrapedData = await scraperService.scrapeQuery(query);
        for (const item of scrapedData) {
          const searchName = item.name.substring(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          let existing = await Product.findOne({ name: { $regex: new RegExp(searchName, 'i') } });

          if (existing) {
            await Product.updateOne({ _id: existing._id }, { 
              $set: { lastScraped: new Date() },
              $pull: { prices: { store: item.store } } 
            });
            await Product.updateOne({ _id: existing._id }, { 
              $push: { prices: { store: item.store, price: item.price, url: item.url, lastUpdated: new Date() } }
            });
          } else {
            await Product.create({
              name: item.name,
              image: item.image,
              category: category || 'General',
              prices: [{ store: item.store, price: item.price, url: item.url, lastUpdated: new Date() }],
              bestPrice: item.price,
              bestStore: item.store,
              lastScraped: new Date()
            });
          }
        }
        // Refetch after scrape (use regex for refresh to be safe)
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        products = await Product.find({ name: { $regex: regex } })
          .skip(skip)
          .limit(PAGE_SIZE)
          .lean();
        totalCount = await Product.countDocuments({ name: { $regex: regex } });
      } catch (e) {
        console.error('[Search API] Scraper secondary error:', e.message);
      }
    }

    // 3. Final Format Logic
    const formatted = products.map(p => {
      const sortedPrices = (p.prices || []).sort((a, b) => a.price - b.price);
      const best = sortedPrices[0];
      return {
        id:            p._id,
        name:          p.name,
        image:         p.image,
        store:         best?.store || p.bestStore || 'Marketplace',
        price:         best?.price || p.bestPrice || 0,
        url:           best?.url || null,
        prices:        sortedPrices,
        category:      p.category,
        originalPrice: best?.originalPrice || p.bestPrice || 0
      };
    }).filter(p => p.price > 0);

    res.json({ 
      results: formatted, 
      totalCount: totalCount, 
      hasMore: totalCount > pageNum * PAGE_SIZE,
      page: pageNum, 
      query 
    });

  } catch (err) {
    console.error('[Search API Critical Error]:', err);
    res.status(500).json({ message: 'Search failed.' });
  }
});

module.exports = router;
