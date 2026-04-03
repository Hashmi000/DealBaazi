/* ── routes/search.js ────────────────────────────── */
const express  = require('express');
const { Product } = require('../models/Product');
const scraperService = require('../services/scraperService');

const router = express.Router();
const PAGE_SIZE = 12;

// Clean name for fuzzy matching
const normalizeName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 40);

/* GET /api/search?q=iphone&page=1&sortBy=price-low&... */
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, category } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ message: 'Query too short.' });

    const query = q.trim();
    const pageNum = Math.max(1, parseInt(page));

    // 1. Initial Database Search
    let products = await Product.find({ $text: { $search: query } })
      .limit(PAGE_SIZE)
      .lean();

    // 2. Trigger LIVE Scrape if needed (No results or stale data > 24 hours)
    const isStale = products.length > 0 && products.some(p => !p.lastScraped || (Date.now() - new Date(p.lastScraped).getTime()) > 24 * 60 * 60 * 1000);
    
    if ((products.length < 1 || isStale) && pageNum === 1) {
      console.log(`Live scraping for "${query}"...`);
      const scrapedData = await scraperService.scrapeQuery(query);

      for (const item of scrapedData) {
        const normName = normalizeName(item.name);
        
        // Find existing product by normalized name similarity (using regex on the original name for now)
        let product = await Product.findOne({ 
          name: { $regex: new RegExp(item.name.substring(0, 20), 'i') } 
        });

        if (product) {
          // Update existing product: Add or Replace store price
          await Product.updateOne(
            { _id: product._id },
            { 
              $set: { lastScraped: new Date() },
              $pull: { prices: { store: item.store } } 
            }
          );
          await Product.updateOne(
            { _id: product._id },
            { 
              $push: { 
                prices: { 
                  store: item.store, 
                  price: item.price, 
                  url: item.url, 
                  lastUpdated: new Date() 
                } 
              }
            }
          );
        } else {
          // Create new product
          await Product.create({
            name: item.name,
            image: item.image,
            category: category || 'General',
            prices: [{
              store: item.store,
              price: item.price,
              url: item.url,
              lastUpdated: new Date()
            }],
            bestPrice: item.price,
            bestStore: item.store,
            lastScraped: new Date()
          });
        }
      }

      // Re-fetch after scraping
      products = await Product.find({ $text: { $search: query } })
        .limit(PAGE_SIZE)
        .lean();
    }

    // 3. Final Format Logic
    const results = products.map(p => {
      const sortedPrices = (p.prices || []).sort((a, b) => a.price - b.price);
      const bestEntry = sortedPrices[0];

      return {
        id:            p._id,
        name:          p.name,
        image:         p.image,
        store:         bestEntry?.store || 'Marketplace',
        price:         bestEntry?.price || 0,
        prices:        sortedPrices,
        category:      p.category
      };
    }).filter(p => p.price > 0);

    res.json({ results, total: results.length, page: pageNum, query });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Search failed.' });
  }
});

module.exports = router;
