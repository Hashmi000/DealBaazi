const axios = require('axios');

/**
 * Searches Amazon using the Omkarcloud REST API Wrapper.
 * This acts as our secondary layer if the official PA-API fails or is unconfigured.
 */
async function searchOmkarCloud(query) {
  const apiKey = process.env.OMKARCLOUD_API_KEY;
  if (!apiKey) {
    return null; // Instruct cascade to fallback to custom scraping
  }

  console.log(`[OmkarCloud] Querying REST API for: "${query}"`);

  try {
    const response = await axios.get('https://api.omkar.cloud/amazon/search', {
      params: {
        api_key: apiKey,
        query: query,
        domain: 'amazon.in' 
      },
      timeout: 10000 
    });

    // Handle generic "success" formats provided by omkarcloud. Let's assume standard results array.
    const results = response.data && response.data.results ? response.data.results : response.data;
    
    if (!Array.isArray(results)) {
       console.log('[OmkarCloud] Unexpected data structure received.');
       return null;
    }

    const parsedData = [];

    for (const item of results.slice(0, 5)) {
      const name = item.title || item.name;
      const priceStr = item.price ? String(item.price).replace(/[^0-9.]/g, '') : null;
      let price = priceStr ? parseFloat(priceStr) : null;
      
      const image = item.image || item.thumbnail;
      let url = item.link || item.url;
      
      if (url && !url.startsWith('http')) {
         url = 'https://www.amazon.in' + url;
      }

      if (name && price) {
        parsedData.push({
          name,
          price,
          originalPrice: item.original_price ? parseFloat(String(item.original_price).replace(/[^0-9.]/g, '')) : price,
          image,
          url,
          store: 'Amazon',
          offers: []
        });
      }
    }

    console.log(`[OmkarCloud] Found ${parsedData.length} items`);
    return parsedData;

  } catch (err) {
    console.error('[OmkarCloud] REST API wrapper failed:', err.response ? err.response.data : err.message);
    return null; // Signals failure so we fall back to our custom cheerio scraper
  }
}

module.exports = {
  searchOmkarCloud,
  isConfigured: () => !!process.env.OMKARCLOUD_API_KEY
};
