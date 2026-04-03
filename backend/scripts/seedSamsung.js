/**
 * seedSamsung.js
 * Reads Samsung phones from Samsung_Phones_Ultimate.xlsx and seeds MongoDB.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { Product } = require('../models/Product');

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected.');

    const workbook = XLSX.readFile('Samsung_Phones_Ultimate.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`Parsing ${rows.length} phones from Excel...`);

    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      const name = row['Model'] || '';
      if (!name) continue;

      // Extract RAM and Storage if possible (Format "6GB/128GB")
      let ram = '';
      let storage = '';
      if (row['RAM/Storage'] && row['RAM/Storage'].includes('/')) {
        [ram, storage] = row['RAM/Storage'].split('/');
      } else {
        ram = row['RAM/Storage'] || '';
      }

      // Map Availability to a recognizable store name
      let storeName = row['Availability'] || 'Marketplace';
      if (storeName.toLowerCase().includes('reliance')) storeName = 'Reliance Digital';
      if (storeName.toLowerCase().includes('amazon')) storeName = 'Amazon';
      if (storeName.toLowerCase().includes('flipkart')) storeName = 'Flipkart';
      if (storeName.toLowerCase().includes('croma')) storeName = 'Croma';

      const phoneData = {
        name,
        brand: 'Samsung',
        category: 'Phones',
        image: '', // Excel doesn't have images, search.js will likely fallback to placeholder
        description: `${name} featuring a ${row['Display']} display and ${row['Processor']} processor.`,
        tags: ['samsung', 'galaxy', name.toLowerCase(), row['Series']?.toLowerCase() || ''].filter(t => t),
        specs: {
          'Series': row['Series'],
          'Display': row['Display'],
          'Processor': row['Processor'],
          'RAM': ram.trim(),
          'Storage': storage.trim(),
          'Camera': row['Camera'],
          'Battery': row['Battery'],
          'Year': row['Launch Year'],
          'Availability': row['Availability']
        },
        prices: [
          {
            store: storeName,
            price: row['Price (₹)'],
            originalPrice: row['Price (₹)'],
            url: `https://www.google.com/search?q=${encodeURIComponent(name + ' ' + storeName)}`,
            inStock: true,
            lastUpdated: new Date()
          }
        ],
        bestPrice: row['Price (₹)'],
        bestStore: storeName,
        lowestEver: row['Price (₹)'],
        lastScraped: new Date()
      };

      // Upsert: update if exists, insert if new
      const existing = await Product.findOne({
        name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') }
      });

      if (existing) {
        await Product.updateOne({ _id: existing._id }, { $set: phoneData });
        console.log(`  ↻ Updated: ${name}`);
        updated++;
      } else {
        await Product.create(phoneData);
        console.log(`  ✚ Inserted: ${name}`);
        inserted++;
      }
    }

    console.log(`\n✅ Done! Total: ${rows.length} | Inserted: ${inserted}, Updated: ${updated}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
    process.exit(1);
  }
}

seed();
