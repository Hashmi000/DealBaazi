/* ── services/specService.js ─────────────────────── */
/**
 * Fetches product specifications by scraping a product's Amazon page.
 * Called when a user clicks on a product card to view details.
 */
const axios   = require('axios');
const cheerio = require('cheerio');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Scrapes specs from an Amazon product page URL.
 * Returns an object like { RAM: '8 GB', Storage: '256 GB', ... }
 */
async function scrapeSpecsFromUrl(productUrl) {
  if (!productUrl || !productUrl.includes('amazon.in')) return {};
  try {
    const { data } = await axios.get(productUrl, {
      headers: {
        'User-Agent': randomUA(),
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
    });
    const $ = cheerio.load(data);
    const specs = {};

    // Method 1: Tech specs table (most electronics)
    $('#productDetails_techSpec_section_1 tr, #productDetails_techSpec_section_2 tr').each((_, row) => {
      const key = $(row).find('th').text().trim();
      const val = $(row).find('td').text().trim().replace(/\s+/g, ' ');
      if (key && val && key.length < 60) specs[key] = val;
    });

    // Method 2: "Additional Information" table
    $('#productDetails_detailBullets_sections1 tr').each((_, row) => {
      const key = $(row).find('th').text().trim();
      const val = $(row).find('td').text().trim().replace(/\s+/g, ' ');
      if (key && val && key.length < 60) specs[key] = val;
    });

    // Method 3: Bullet points below title (common for all products)
    if (Object.keys(specs).length === 0) {
      $('#feature-bullets li span:not(.aok-hidden)').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 5 && text.length < 200) {
          const colon = text.indexOf(':');
          if (colon > 0 && colon < 40) {
            specs[text.substring(0, colon).trim()] = text.substring(colon + 1).trim();
          }
        }
      });
    }

    return specs;
  } catch (err) {
    console.warn('[SpecScraper] Failed:', err.message);
    return {};
  }
}

/**
 * Search Amazon for a product by name and scrape specs from the first result.
 */
async function scrapeSpecsBySearch(productName) {
  try {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`;
    const { data } = await axios.get(searchUrl, {
      headers: { 'User-Agent': randomUA(), 'Accept-Language': 'en-US,en;q=0.9' },
      timeout: 10000,
    });
    const $ = cheerio.load(data);

    // Get first product link
    let firstLink = null;
    $('.s-result-item[data-component-type="s-search-result"] h2 a').each((_, el) => {
      if (!firstLink) {
        let href = $(el).attr('href');
        if (href) {
          firstLink = href.startsWith('http') ? href : 'https://www.amazon.in' + href;
        }
      }
    });

    if (!firstLink) return {};
    return await scrapeSpecsFromUrl(firstLink);
  } catch (err) {
    console.warn('[SpecScraper] Search failed:', err.message);
    return {};
  }
}

module.exports = { scrapeSpecsFromUrl, scrapeSpecsBySearch };
