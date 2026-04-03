/* ── models/Product.js ───────────────────────────── */
const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  store:     String,
  price:     Number,
  date:      { type: Date, default: Date.now }
});

const storePriceSchema = new mongoose.Schema({
  store:         String,
  storeId:       String, // store's product ID
  price:         Number,
  originalPrice: Number,
  url:           String,
  inStock:       { type: Boolean, default: true },
  offers:        [String],
  lastUpdated:   { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, index: true },
  brand:         String,
  category:      String,
  image:         String,
  description:   String,
  tags:          [String],

  // All store prices
  prices:        [storePriceSchema],

  // Best / lowest prices
  bestPrice:     Number,
  bestStore:     String,
  lowestEver:    Number,
  lowestEverDate: String,

  // Price history for charts
  priceHistory:  [priceHistorySchema],

  // Metadata
  isActive:      { type: Boolean, default: true },
  lastScraped:   { type: Date, default: Date.now },
  searchCount:   { type: Number, default: 0 }
}, {
  timestamps: true,
  // Full text search index
  autoIndex: true
});

productSchema.index({ name: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1 });
const Product = mongoose.model('Product', productSchema);

/* ── models/PriceAlert.js ────────────────────────── */
const alertSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId:   { type: String, required: true },
  productName: String,
  targetPrice: { type: Number, required: true },
  currentPrice: Number,
  isTriggered: { type: Boolean, default: false },
  triggeredAt: Date,
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

const PriceAlert = mongoose.model('PriceAlert', alertSchema);

module.exports = { Product, PriceAlert };
