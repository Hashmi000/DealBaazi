const axios = require('axios');
const cheerio = require('cheerio');
const amazonPaApi = require('./amazonPaApiService');
const omkarCloud = require('./omkarcloudService');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
];

function getHeaders() {
  return {
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive'
  };
}

/**
 * Scrapes Amazon India for a search query
 */
async function scrapeAmazon(query) {
  try {
    const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders(), timeout: 8000 });
    const $ = cheerio.load(data);
    const results = [];
    
    // Debugging: Log the first 500 characters of the response
    console.log(`[Amazon Scrape] Response length: ${data.length}`);
    if (data.includes('To discuss automated access to Amazon data please contact api-services-support@amazon.com')) {
      console.error('❌ Amazon blocked the request (Robot Check)');
      return [];
    }

    $('.s-result-item[data-component-type="s-search-result"]').each((i, el) => {
      if (results.length >= 5) return;

      const name = $(el).find('h2 span').first().text().trim();
      const priceStr = $(el).find('.a-price-whole').first().text().replace(/[,₹]/g, '');
      const price = parseInt(priceStr);
      const image = $(el).find('img.s-image').attr('src');
      let link = $(el).find('h2 a').attr('href');
      
      if (link && !link.startsWith('http')) link = 'https://www.amazon.in' + link;
      const amzTag = process.env.AMAZON_AFFILIATE_TAG || 'dealbaaziaf-21';
      if (link) {
         link = link.includes('?') ? `${link}&tag=${amzTag}` : `${link}?tag=${amzTag}`;
      }

      console.log(`[Amazon] Found item: "${name.substring(0, 30)}..." | Price: ${price}`);

      if (name && price) {
        results.push({
          name,
          price,
          originalPrice: price, // Fallback
          image,
          url: link,
          store: 'Amazon',
          offers: []
        });
      }
    });
    console.log(`[Amazon] Final results count: ${results.length}`);
    return results;

  } catch (err) {
    console.error('Amazon scrape error:', err.message);
    return [];
  }
}

/**
 * Scrapes Flipkart for a search query
 */
async function scrapeFlipkart(query) {
  try {
    const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { headers: getHeaders(), timeout: 8000 });
    const $ = cheerio.load(data);
    const results = [];

    console.log(`[Flipkart Scrape] Response length: ${data.length}`);

    const fkAffid = process.env.FLIPKART_AFFILIATE_ID || 'dealbaazi';

    // Robust structural extraction instead of volatile classes
    $('div[data-id]').each((i, el) => {
        if (results.length >= 5) return;
        
        const linkEl = $(el).find('a[href*="/p/"]');
        if (!linkEl.length) return;
        
        let link = linkEl.attr('href');
        let url = link.startsWith('http') ? link : 'https://www.flipkart.com' + link;
        url = url.includes('?') ? `${url}&affid=${fkAffid}` : `${url}?affid=${fkAffid}`;
        
        const name = linkEl.find('img').attr('alt');
        const image = linkEl.find('img').attr('src');
        
        let priceStr = '';
        linkEl.find('*').each((j, innerEl) => {
            const text = $(innerEl).text().trim();
            if (text.startsWith('₹') && text.length > 1 && text.length < 15 && text.indexOf(' ') === -1) {
                if (!priceStr || text.length < priceStr.length) {
                    priceStr = text;
                }
            }
        });

        if (name && priceStr) {
            const price = parseInt(priceStr.replace(/[^0-9]/g, ''));
            results.push({
                name,
                price,
                originalPrice: price, // Fallback
                image,
                url,
                store: 'Flipkart',
                offers: []
            });
        }
    });

    console.log(`[Flipkart] Final results count: ${results.length}`);
    return results;
  } catch (err) {
    console.error('Flipkart scrape error:', err.message);
    return [];
  }
}

/**
 * Main aggregator: scrapes multiple stores and merges results
 * Implements a cascade for Amazon to use official APIs first.
 */
async function scrapeQuery(query) {
  console.log(`🔍 Starting live scrape for: "${query}"`);
  
  // Scrape Amazon via Cascade
  let amazon = await amazonPaApi.searchPaApi(query);
  
  if (!amazon) {
    console.log('🔄 Missing PA-API credentials or failure; falling back to OmkarCloud API...');
    amazon = await omkarCloud.searchOmkarCloud(query);
  }
  
  if (!amazon) {
    console.log('🔄 Missing OmkarCloud credentials or failure; falling back to Custom Web Scraper...');
    amazon = await scrapeAmazon(query);
  }

  // Scrape Flipkart in parallel (well, sequentially if Amazon was slow, but Flipkart is fast)
  // To keep speed, we can await it here.
  const flipkart = await scrapeFlipkart(query);

  const allResults = [...(amazon || []), ...(flipkart || [])];
  console.log(`✅ Scrape complete. Found ${allResults.length} items.`);
  
  return allResults;
}

module.exports = {
  scrapeAmazon,
  scrapeFlipkart,
  scrapeQuery
};

