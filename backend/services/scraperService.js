/* ── services/scraperService.js ──────────────────── */
const axios       = require('axios');
const cheerio     = require('cheerio');
const amazonPaApi = require('./amazonPaApiService');
const omkarCloud  = require('./omkarcloudService');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
];

function getHeaders() {
  return {
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  };
}

/* ─────────────────────────────────────────────────
   AMAZON INDIA
───────────────────────────────────────────────── */
async function scrapeAmazon(query) {
  try {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders(), timeout: 12000 });
    const $ = cheerio.load(data);
    const results = [];

    console.log(`[Amazon] Response length: ${data.length}`);
    if (data.includes('api-services-support@amazon.com')) {
      console.error('❌ Amazon Robot Check triggered');
      return [];
    }

    $('.s-result-item[data-component-type="s-search-result"]').each((i, el) => {
      if (results.length >= 6) return;

      const name     = $(el).find('h2 span').first().text().trim();
      const priceStr = $(el).find('.a-price-whole').first().text().replace(/[,₹\s]/g, '');
      const price    = parseInt(priceStr);
      const image    = $(el).find('img.s-image').attr('src');
      let link       = $(el).find('h2 a').attr('href');

      if (link && !link.startsWith('http')) link = 'https://www.amazon.in' + link;
      const amzTag = process.env.AMAZON_AFFILIATE_TAG || 'dealbaaziaf-21';
      if (link) link = link.includes('?') ? `${link}&tag=${amzTag}` : `${link}?tag=${amzTag}`;

      if (name && price > 0) {
        results.push({ name, price, originalPrice: price, image, url: link, store: 'Amazon', offers: [] });
      }
    });

    console.log(`[Amazon] Found ${results.length} items`);
    return results;
  } catch (err) {
    console.error('[Amazon] Scrape error:', err.message);
    return [];
  }
}

/* ─────────────────────────────────────────────────
   FLIPKART
───────────────────────────────────────────────── */
async function scrapeFlipkart(query) {
  try {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders(), timeout: 12000 });
    const $ = cheerio.load(data);
    const results = [];
    const fkAffid = process.env.FLIPKART_AFFILIATE_ID || 'dealbaazi';

    console.log(`[Flipkart] Response length: ${data.length}`);

    $('div[data-id]').each((i, el) => {
      if (results.length >= 6) return;

      const linkEl = $(el).find('a[href*="/p/"]');
      if (!linkEl.length) return;

      let link = linkEl.attr('href');
      let productUrl = link.startsWith('http') ? link : 'https://www.flipkart.com' + link;
      productUrl = productUrl.includes('?') ? `${productUrl}&affid=${fkAffid}` : `${productUrl}?affid=${fkAffid}`;

      const name  = linkEl.find('img').attr('alt');
      const image = linkEl.find('img').attr('src');

      let priceStr = '';
      linkEl.find('*').each((j, innerEl) => {
        const text = $(innerEl).text().trim();
        if (text.startsWith('₹') && text.length > 1 && text.length < 15 && !text.includes(' ')) {
          if (!priceStr || text.length < priceStr.length) priceStr = text;
        }
      });

      if (name && priceStr) {
        const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
        if (price > 0) {
          results.push({ name, price, originalPrice: price, image, url: productUrl, store: 'Flipkart', offers: [] });
        }
      }
    });

    console.log(`[Flipkart] Found ${results.length} items`);
    return results;
  } catch (err) {
    console.error('[Flipkart] Scrape error:', err.message);
    return [];
  }
}

/* ─────────────────────────────────────────────────
   MEESHO
───────────────────────────────────────────────── */
async function scrapeMeesho(query) {
  try {
    const url = `https://www.meesho.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders(), timeout: 12000 });
    const $ = cheerio.load(data);
    const results = [];

    console.log(`[Meesho] Response length: ${data.length}`);

    // Meesho product cards — look for price and product link patterns
    $('a[href*="/p/"]').each((i, el) => {
      if (results.length >= 5) return;

      const href = $(el).attr('href');
      const productUrl = href.startsWith('http') ? href : 'https://www.meesho.com' + href;
      const name  = $(el).find('p').first().text().trim() || $(el).attr('title') || '';
      const image = $(el).find('img').attr('src');

      // Find price nearby
      let priceStr = '';
      $(el).find('h5, span, p').each((_, innerEl) => {
        const text = $(innerEl).text().trim();
        if ((text.startsWith('₹') || text.match(/^\d{2,6}$/)) && text.length < 10) {
          if (!priceStr) priceStr = text;
        }
      });

      if (name && priceStr) {
        const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
        if (price > 0 && name.length > 3) {
          results.push({ name, price, originalPrice: price, image, url: productUrl, store: 'Meesho', offers: [] });
        }
      }
    });

    console.log(`[Meesho] Found ${results.length} items`);
    return results;
  } catch (err) {
    console.error('[Meesho] Scrape error:', err.message);
    return [];
  }
}

/* ─────────────────────────────────────────────────
   MYNTRA (Fashion & Lifestyle)
───────────────────────────────────────────────── */
async function scrapeMyntra(query) {
  try {
    const url = `https://www.myntra.com/${encodeURIComponent(query.toLowerCase().replace(/\s+/g, '-'))}`;
    const { data } = await axios.get(url, { headers: getHeaders(), timeout: 12000 });
    const $ = cheerio.load(data);
    const results = [];

    console.log(`[Myntra] Response length: ${data.length}`);

    // Myntra renders in React — try to extract from JSON data embedded in page
    const scriptContent = $('script').map((_, el) => $(el).html()).get().find(s => s && s.includes('"discountedPrice"'));
    if (scriptContent) {
      try {
        const match = scriptContent.match(/window\.__myx\s*=\s*(\{.+?\});/s);
        if (match) {
          const parsed = JSON.parse(match[1]);
          const items = parsed?.searchData?.results?.products || [];
          items.slice(0, 6).forEach(item => {
            results.push({
              name:          item.productName || item.brand + ' ' + item.productName,
              price:         item.discountedPrice || item.price,
              originalPrice: item.mrp || item.price,
              image:         item.images?.[0] ? `https://assets.myntassets.com/h_720,q_90,w_540/v1/assets/images/${item.images[0]}.jpg` : '',
              url:           `https://www.myntra.com/${item.landingPageUrl || ''}`,
              store:         'Myntra',
              offers:        [],
            });
          });
        }
      } catch (_) { /* JSON parse failed, fallback below */ }
    }

    // Fallback: DOM scrape
    if (results.length === 0) {
      $('.product-base').each((i, el) => {
        if (results.length >= 5) return;
        const name  = $(el).find('.product-brand').text().trim() + ' ' + $(el).find('.product-product').text().trim();
        const priceStr = $(el).find('.product-discountedPrice').text().trim() || $(el).find('.product-price').text().trim();
        const image = $(el).find('img').attr('src');
        let link = $(el).closest('a').attr('href');
        if (link && !link.startsWith('http')) link = 'https://www.myntra.com' + link;
        if (name.trim().length > 2 && priceStr) {
          const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
          if (price > 0) results.push({ name: name.trim(), price, originalPrice: price, image, url: link, store: 'Myntra', offers: [] });
        }
      });
    }

    console.log(`[Myntra] Found ${results.length} items`);
    return results;
  } catch (err) {
    console.error('[Myntra] Scrape error:', err.message);
    return [];
  }
}

/* ─────────────────────────────────────────────────
   CROMA (Electronics)
───────────────────────────────────────────────── */
async function scrapeCroma(query) {
  try {
    const url = `https://www.croma.com/searchB?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders(), timeout: 12000 });
    const $ = cheerio.load(data);
    const results = [];

    console.log(`[Croma] Response length: ${data.length}`);

    $('li.product-item').each((i, el) => {
      if (results.length >= 5) return;

      const name  = $(el).find('h3.product-title a, a.product-title').text().trim();
      const priceStr = $(el).find('[class*="amount"], .pd-price, [class*="price"]').first().text().trim();
      const image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
      let link = $(el).find('a').first().attr('href');
      if (link && !link.startsWith('http')) link = 'https://www.croma.com' + link;

      if (name && priceStr) {
        const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
        if (price > 0) {
          results.push({ name, price, originalPrice: price, image, url: link, store: 'Croma', offers: [] });
        }
      }
    });

    console.log(`[Croma] Found ${results.length} items`);
    return results;
  } catch (err) {
    console.error('[Croma] Scrape error:', err.message);
    return [];
  }
}

/* ─────────────────────────────────────────────────
   RELIANCE DIGITAL
───────────────────────────────────────────────── */
async function scrapeReliance(query) {
  try {
    const url = `https://www.reliancedigital.in/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders(), timeout: 12000 });
    const $ = cheerio.load(data);
    const results = [];

    console.log(`[Reliance] Response length: ${data.length}`);

    // Reliance Digital product cards
    $('[class*="product"], [class*="Product"]').each((i, el) => {
      if (results.length >= 5) return;

      const name  = $(el).find('[class*="title"], [class*="name"], h3, h4').first().text().trim();
      const priceStr = $(el).find('[class*="price"], [class*="Price"], [class*="amount"]').first().text().trim();
      const image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');
      let link = $(el).find('a').attr('href');
      if (link && !link.startsWith('http')) link = 'https://www.reliancedigital.in' + link;

      if (name && name.length > 3 && priceStr) {
        const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
        if (price > 0) {
          results.push({ name, price, originalPrice: price, image, url: link, store: 'Reliance Digital', offers: [] });
        }
      }
    });

    console.log(`[Reliance] Found ${results.length} items`);
    return results;
  } catch (err) {
    console.error('[Reliance] Scrape error:', err.message);
    return [];
  }
}

/* ─────────────────────────────────────────────────
   MAIN AGGREGATOR — All stores in parallel
───────────────────────────────────────────────── */
async function scrapeQuery(query) {
  console.log(`🔍 Starting parallel scrape for: "${query}"`);

  // Amazon cascade wrapped in async fn so it doesn't block other stores
  const getAmazon = async () => {
    const paApi = await amazonPaApi.searchPaApi(query);
    if (paApi && paApi.length > 0) return paApi;

    const omkar = await omkarCloud.searchOmkarCloud(query);
    if (omkar && omkar.length > 0) return omkar;

    console.log('🔄 Falling back to Amazon web scraper...');
    return scrapeAmazon(query);
  };

  // All stores run at the same time
  const [amazon, flipkart, meesho, myntra, croma, reliance] = await Promise.all([
    getAmazon(),
    scrapeFlipkart(query),
    scrapeMeesho(query),
    scrapeMyntra(query),
    scrapeCroma(query),
    scrapeReliance(query),
  ]);

  const allResults = [
    ...(amazon   || []),
    ...(flipkart || []),
    ...(meesho   || []),
    ...(myntra   || []),
    ...(croma    || []),
    ...(reliance || []),
  ];

  const storeCount = [amazon, flipkart, meesho, myntra, croma, reliance].filter(r => r && r.length > 0).length;
  console.log(`✅ Scrape complete. ${allResults.length} items from ${storeCount} stores.`);
  return allResults;
}

module.exports = {
  scrapeAmazon,
  scrapeFlipkart,
  scrapeMeesho,
  scrapeMyntra,
  scrapeCroma,
  scrapeReliance,
  scrapeQuery,
};
