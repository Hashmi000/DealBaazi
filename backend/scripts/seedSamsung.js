/**
 * seedSamsung.js
 * Enriches Samsung product data with live marketplace links and series-specific imagery.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { Product } = require('../models/Product');

// Helper: Generate marketplace search links
function generateMarketplaceLinks(model) {
  const q = encodeURIComponent(`Samsung ${model}`);
  return [
    {
      store: 'Amazon India',
      price: 0, // Placeholder, will be updated by scraper
      url: `https://www.amazon.in/s?k=${q}`,
      inStock: true
    },
    {
      store: 'Flipkart',
      price: 0,
      url: `https://www.flipkart.com/search?q=${q}`,
      inStock: true
    },
    {
      store: 'Reliance Digital',
      price: 0,
      url: `https://www.reliancedigital.in/search?q=${q}`,
      inStock: true
    }
  ];
}

// Helper: Assign high-quality imagery based on series
function getSeriesImage(series, model) {
  const s = (series || '').toUpperCase();
  const m = (model || '').toUpperCase();

  if (s === 'S' || m.includes('ULTRA')) {
    return 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-s928bzkhinx/gallery/in-galaxy-s24-s928-490333-sm-s928bzkhinx-thumb-539401764';
  }
  if (s === 'Z' || m.includes('FOLD') || m.includes('FLIP')) {
    return 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-f946bzkhinx/gallery/in-galaxy-z-fold5-f946-sm-f946bzkhinx-thumb-537409240';
  }
  if (s === 'A') {
    return 'https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-a15-5g-sm-a156-sm-a156bzkhins-thumb-539324571';
  }
  if (s === 'M' || s === 'F') {
    return 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-m156bzbahin/gallery/in-galaxy-m15-5g-sm-m156-sm-m156bzbahin-thumb-540632331';
  }
  // Default fallback
  return 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-a055fzkvins/gallery/in-galaxy-a05-sm-a055-sm-a055fzkvins-thumb-538965004';
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    const workbook = XLSX.readFile('Samsung_Phones_Ultimate.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`Parsing and Enriching ${rows.length} phones...`);

    let updated = 0;

    for (const row of rows) {
      const name = row['Model'] || '';
      if (!name) continue;

      const series = row['Series'] || 'General';
      const price = Number(row['Price (₹)']) || 0;
      const storeName = row['Availability'] || 'Marketplace';
      
      // Generate enriched links
      const marketplaceLinks = generateMarketplaceLinks(name);
      
      // Merge with the primary availability from Excel
      const primaryUrl = `https://www.google.com/search?q=${encodeURIComponent('Samsung ' + name + ' ' + storeName)}`;
      
      const prices = [
        {
          store: storeName,
          price: price,
          originalPrice: price,
          url: primaryUrl,
          inStock: true,
          lastUpdated: new Date()
        },
        ...marketplaceLinks
      ];

      const phoneData = {
        name,
        brand: 'Samsung',
        category: 'Phones',
        image: getSeriesImage(series, name),
        description: `${name} (${series} Series) featuring a ${row['Display']} display and powerful ${row['Processor']} processor. Available now on ${storeName}.`,
        tags: ['samsung', 'galaxy', name.toLowerCase(), series.toLowerCase()].filter(t => t),
        specs: {
          'Series': series,
          'Display': row['Display'],
          'Processor': row['Processor'],
          'Camera': row['Camera'],
          'Battery': row['Battery'],
          'Launch Year': row['Launch Year'],
          'Primary Store': storeName
        },
        prices: prices,
        bestPrice: price,
        bestStore: storeName,
        rating: (Math.random() * (4.9 - 4.1) + 4.1).toFixed(1), // Professional mock rating
        reviews: Math.floor(Math.random() * 15000) + 500
      };

      // Upsert
      await Product.findOneAndUpdate(
        { name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') } },
        { $set: phoneData },
        { upsert: true, new: true }
      );
      
      updated++;
      if (updated % 20 === 0) console.log(`  Processed ${updated}/${rows.length}...`);
    }

    console.log(`\n✅ Done! Successfully enriched ${updated} phones on GitHub-ready database.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
    process.exit(1);
  }
}

seed();
