const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Product } = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * High-quality series-level images (Replace with specific ones if available)
 */
const SERIES_IMAGES = {
  iphone15: 'https://images.unsplash.com/photo-1695048133142-1a20484d256e?auto=format&fit=crop&q=80&w=260',
  iphone14: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?auto=format&fit=crop&q=80&w=260',
  pixel8:   'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=260',
  oneplus12: 'https://images.unsplash.com/photo-1707204964687-8d070b427773?auto=format&fit=crop&q=80&w=260',
  macbook:  'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?auto=format&fit=crop&q=80&w=260'
};

const NEW_PRODUCTS = [
  // --- IPONES ---
  { name: 'Apple iPhone 15 Pro Max (256 GB)', brand: 'Apple', category: 'Smartphones', series: 'iphone15' },
  { name: 'Apple iPhone 15 Pro (128 GB)', brand: 'Apple', category: 'Smartphones', series: 'iphone15' },
  { name: 'Apple iPhone 15 Plus (128 GB)', brand: 'Apple', category: 'Smartphones', series: 'iphone15' },
  { name: 'Apple iPhone 15 (128 GB)', brand: 'Apple', category: 'Smartphones', series: 'iphone15' },
  { name: 'Apple iPhone 14 (128 GB)', brand: 'Apple', category: 'Smartphones', series: 'iphone14' },
  { name: 'Apple iPhone 13 (128 GB)', brand: 'Apple', category: 'Smartphones', series: 'iphone14' },

  // --- PIXELS ---
  { name: 'Google Pixel 8 Pro (128 GB)', brand: 'Google', category: 'Smartphones', series: 'pixel8' },
  { name: 'Google Pixel 8 (128 GB)', brand: 'Google', category: 'Smartphones', series: 'pixel8' },
  { name: 'Google Pixel 7a (128 GB)', brand: 'Google', category: 'Smartphones', series: 'pixel8' },

  // --- ONEPLUS ---
  { name: 'OnePlus 12 (512 GB)', brand: 'OnePlus', category: 'Smartphones', series: 'oneplus12' },
  { name: 'OnePlus 12R (256 GB)', brand: 'OnePlus', category: 'Smartphones', series: 'oneplus12' },
  { name: 'OnePlus Nord 3 5G', brand: 'OnePlus', category: 'Smartphones', series: 'oneplus12' },

  // --- LAPTOPS ---
  { name: 'Apple MacBook Air M3 (13-inch, 256 GB)', brand: 'Apple', category: 'Laptops', series: 'macbook' },
  { name: 'Apple MacBook Air M2 (13-inch, 256 GB)', brand: 'Apple', category: 'Laptops', series: 'macbook' },
  { name: 'Apple MacBook Pro M3 (14-inch, 512 GB)', brand: 'Apple', category: 'Laptops', series: 'macbook' },
  { name: 'HP Pavilion 15 (Ryzen 5, 16 GB)', brand: 'HP', category: 'Laptops', series: 'macbook' },
  { name: 'ASUS Vivobook 16 (Intel i5, 16 GB)', brand: 'ASUS', category: 'Laptops', series: 'macbook' }
];

function generateMarketplaceLinks(name) {
  const q = encodeURIComponent(name);
  return [
    { store: 'Amazon', price: 0, url: `https://www.amazon.in/s?k=${q}`, lastUpdated: new Date() },
    { store: 'Flipkart', price: 0, url: `https://www.flipkart.com/search?q=${q}`, lastUpdated: new Date() },
    { store: 'Reliance Digital', price: 0, url: `https://www.reliancedigital.in/search?q=${q}`, lastUpdated: new Date() },
    { store: 'Croma', price: 0, url: `https://www.croma.com/search?q=${q}`, lastUpdated: new Date() }
  ];
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB for Expansion');

    for (const p of NEW_PRODUCTS) {
      const prices = generateMarketplaceLinks(p.name);
      const mockPrice = Math.floor(Math.random() * (120000 - 30000) + 30000);
      
      // Update first store with realistic base price
      prices[0].price = mockPrice;
      prices[1].price = mockPrice - 499;
      prices[2].price = mockPrice + 1000;
      prices[3].price = mockPrice + 200;

      const productData = {
        name: p.name,
        brand: p.brand,
        category: p.category,
        image: SERIES_IMAGES[p.series] || 'https://via.placeholder.com/200x180?text=Premium+Tech',
        prices: prices,
        bestPrice: mockPrice - 499,
        bestStore: 'Flipkart',
        rating: (Math.random() * (4.9 - 4.2) + 4.2).toFixed(1),
        reviews: Math.floor(Math.random() * 15000) + 500,
        lastScraped: new Date(),
        specs: {
          Brand: p.brand,
          Series: p.category,
          Model: p.name.split('(')[0].trim()
        }
      };

      await Product.findOneAndUpdate(
        { name: p.name },
        productData,
        { upsert: true, new: true }
      );
      console.log(`[SEED] Expanded: ${p.name}`);
    }

    console.log('✨ Data Expansion Complete!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
}

seed();
