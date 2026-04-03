const amazon = require('amazon-product-api');

// Create the client using ENV credentials
let client = null;

try {
  if (process.env.AMAZON_AWS_ID && process.env.AMAZON_AWS_SECRET && process.env.AMAZON_ASSOC_TAG) {
    client = amazon.createClient({
      awsId: process.env.AMAZON_AWS_ID,
      awsSecret: process.env.AMAZON_AWS_SECRET,
      awsTag: process.env.AMAZON_ASSOC_TAG
    });
  }
} catch (e) {
  console.log('[PA-API] Credentials missing or invalid. Module offline.');
}

/**
 * Searches Amazon using the official Product Advertising API.
 * This is the fastest, safest, and most official way to extract product data
 * and is the preferred method if credentials are provided in `.env`.
 */
async function searchPaApi(query) {
  if (!client) {
    return null; // Signals orchestrator to fallback
  }

  console.log(`[PA-API] Querying Amazon PA-API for: "${query}"`);
  
  try {
    const results = await client.itemSearch({
      keywords: query,
      searchIndex: 'All',
      responseGroup: 'ItemAttributes,Offers,Images'
    });

    const parsedData = [];
    
    // Parse official API payload into DealBaazi standard format
    if (results && results.length > 0) {
      for (const item of results.slice(0, 5)) {
        try {
          const itemAttrs = item.ItemAttributes[0] || {};
          const offers = item.Offers && item.Offers[0] && item.Offers[0].Offer ? item.Offers[0].Offer[0] : null;

          const name = itemAttrs.Title ? itemAttrs.Title[0] : '';
          let price = null;
          let originalPrice = null;

          if (offers && offers.OfferListing && offers.OfferListing[0]) {
            const listing = offers.OfferListing[0];
            if (listing.Price && listing.Price[0]) {
               price = parseInt(listing.Price[0].Amount[0]) / 100;
            }
          } else if (itemAttrs.ListPrice && itemAttrs.ListPrice[0]) {
            price = parseInt(itemAttrs.ListPrice[0].Amount[0]) / 100;
          }

          const image = item.LargeImage && item.LargeImage[0] ? item.LargeImage[0].URL[0] : null;
          const url = item.DetailPageURL ? item.DetailPageURL[0] : null;

          if (name && price) {
            parsedData.push({
              name,
              price,
              originalPrice: price, 
              image,
              url,
              store: 'Amazon',
              offers: []
            });
          }
        } catch (parseErr) {
          console.error('[PA-API] Error parsing item:', parseErr.message);
        }
      }
    }
    
    console.log(`[PA-API] Found ${parsedData.length} items`);
    return parsedData;

  } catch (err) {
    if (err.length) { 
      // amazon-product-api often returns an array of errors per response item
      console.error('[PA-API] Request failed:', JSON.stringify(err[0].Error[0])); 
    } else {
      console.error('[PA-API] Search error:', err.message);
    }
    return null; // Instruct cascade to gracefully fall back
  }
}

module.exports = {
  searchPaApi,
  isConfigured: () => client !== null
};
