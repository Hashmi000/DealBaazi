/* ── routes/search.js ────────────────────────────── */
const express  = require('express');
const { Product } = require('../models/Product');
const scraperService = require('../services/scraperService');

const router = express.Router();
const PAGE_SIZE = 12;

/* GET /api/search?q=iphone&page=1&sortBy=price-low&... */
router.get('/', async (req, res) => {
  try {
    const {
      q, page = 1, category, marketplaces,
      priceMin, priceMax, sortBy, offersOnly, inStockOnly
    } = req.query;

    if (!q || q.trim().length < 2)
      return res.status(400).json({ message: 'Query too short.' });

    const query = q.trim();
    const pageNum = Math.max(1, parseInt(page));
    const skip = (pageNum - 1) * PAGE_SIZE;

    // Build MongoDB filter
    const filter = {
      $text: { $search: query },
      isActive: true
    };
    if (category)  filter.category = category;
    if (priceMin || priceMax) {
      filter.bestPrice = {};
      if (priceMin) filter.bestPrice.$gte = Number(priceMin);
      if (priceMax) filter.bestPrice.$lte = Number(priceMax);
    }
    if (offersOnly === '1') filter['prices.offers.0'] = { $exists: true };

    // Marketplace filter
    const activeMarkets = marketplaces?.split(',').filter(Boolean);

    // Sort
    let sort = { score: { $meta: 'textScore' } };
    if (sortBy === 'price-low')  sort = { bestPrice: 1 };
    if (sortBy === 'price-high') sort = { bestPrice: -1 };
    if (sortBy === 'discount')   sort = { discountPct: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter, { score: { $meta: 'textScore' } })
        .sort(sort)
        .skip(skip)
        .limit(PAGE_SIZE)
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Track search count
    Product.updateMany(
      { _id: { $in: products.map(p => p._id) } },
      { $inc: { searchCount: 1 } }
    ).catch(() => {});

    // If too few results, trigger live scrape (async — don't await)
    if (products.length < 3) {
      scraperService.scrapeQuery(query).catch(err =>
        console.error('Background scrape error:', err)
      );
    }

    // Map + filter by marketplace if needed
    const results = products.map(p => {
      let prices = p.prices || [];
      if (activeMarkets?.length) {
        prices = prices.filter(s =>
          activeMarkets.some(m => s.store?.toLowerCase().includes(m))
        );
      }
      if (inStockOnly === '1') prices = prices.filter(s => s.inStock);

      const bestEntry = prices.sort((a, b) => a.price - b.price)[0];

      return {
        id:            p._id,
        name:          p.name,
        image:         p.image,
        store:         bestEntry?.store || p.bestStore,
        price:         bestEntry?.price || p.bestPrice,
        originalPrice: bestEntry?.originalPrice,
        lowestEver:    p.lowestEver,
        isLowestEver:  bestEntry?.price && bestEntry.price <= (p.lowestEver || Infinity),
        offers:        bestEntry?.offers || [],
        category:      p.category
      };
    }).filter(p => p.price);

    res.json({
      results,
      total,
      page: pageNum,
      hasMore: skip + PAGE_SIZE < total,
      query
    });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Search failed.' });
  }
});

module.exports = router;
