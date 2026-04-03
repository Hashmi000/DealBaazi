/* ============================================================
   DealBaazi v2 — products-data.js
   All product data: prices across marketplaces, specs,
   purchase links, offers. Replace URLs with affiliate links.
   ============================================================ */

const PRODUCTS = {

  /* ── LAPTOPS ──────────────────────────────────────────────── */
  laptops: [
    {
      id: 'macbook-air-m3',
      name: 'Apple MacBook Air 13" M3 (2024)',
      brand: 'Apple',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=452&hei=420&fmt=jpeg&qlt=95&.v=1653084303665',
      rating: 4.8, reviews: 2841,
      category: 'laptops',
      badges: ['Best Seller', 'Lowest Ever'],
      lowestEver: 99900,
      specs: {
        'Processor': 'Apple M3 (8-core CPU, 10-core GPU)',
        'RAM': '8GB Unified Memory',
        'Storage': '256GB SSD',
        'Display': '13.6" Liquid Retina, 2560×1664',
        'Battery': 'Up to 18 hours',
        'OS': 'macOS Sonoma',
        'Weight': '1.24 kg',
        'Ports': '2× USB-C / Thunderbolt 3, MagSafe 3'
      },
      prices: [
        { store:'Amazon India',      price:114900, mrp:134900, inStock:true,  badge:'Prime', url:'https://www.amazon.in/dp/B0CX23Y92K', offers:['No Cost EMI from ₹9,575/month','₹5,000 off with HDFC Card'] },
        { store:'Flipkart',          price:116990, mrp:134900, inStock:true,  url:'https://www.flipkart.com/apple-macbook-air/p/itm', offers:['Axis Bank 10% off','SuperCoin rewards'] },
        { store:'Apple Store India', price:119900, mrp:134900, inStock:true,  url:'https://www.apple.com/in/shop/buy-mac/macbook-air', offers:['Student discount available','Free engraving'] },
        { store:'Croma',             price:121990, mrp:134900, inStock:true,  url:'https://www.croma.com/apple-macbook-air', offers:['EMI from ₹10,166/month'] },
        { store:'Reliance Digital',  price:122000, mrp:134900, inStock:false, url:'https://www.reliancedigital.in/apple-macbook-air' }
      ]
    },
    {
      id: 'dell-xps-15',
      name: 'Dell XPS 15 (2024) — Core i7 OLED',
      brand: 'Dell',
      image: 'https://i.dell.com/sites/csimages/App-Merchandizing_Images/all/xps-15-9530-laptop.jpg',
      rating: 4.6, reviews: 912,
      category: 'laptops',
      badges: ['Top Rated'],
      lowestEver: 149000,
      specs: {
        'Processor': 'Intel Core i7-13700H',
        'RAM': '16GB DDR5 5200MHz',
        'Storage': '512GB NVMe SSD',
        'Display': '15.6" OLED 3.5K Touch, 120Hz',
        'GPU': 'NVIDIA GeForce RTX 4060',
        'Battery': '86Wh, up to 13 hours',
        'OS': 'Windows 11 Home',
        'Weight': '1.86 kg'
      },
      prices: [
        { store:'Dell India',   price:159990, mrp:189990, inStock:true,  url:'https://www.dell.com/en-in/shop/laptops/xps-15', offers:['Dell Advantage program','Free 1-year accidental damage'] },
        { store:'Amazon India', price:164990, mrp:189990, inStock:true,  url:'https://www.amazon.in/Dell-XPS-15-9530', offers:['No Cost EMI','HDFC 5% cashback'] },
        { store:'Flipkart',     price:167000, mrp:189990, inStock:true,  url:'https://www.flipkart.com/dell-xps-15', offers:['Flipkart Axis Card 5% off'] },
        { store:'Croma',        price:169990, mrp:189990, inStock:true,  url:'https://www.croma.com/dell-xps-15' }
      ]
    },
    {
      id: 'asus-rog-strix-g16',
      name: 'ASUS ROG Strix G16 Gaming Laptop',
      brand: 'ASUS ROG',
      image: 'https://dlcdnwebimgs.asus.com/gain/5D2F1B14-A14F-4E4C-A9E1-FBE2FF7E7B5E/w800/fwebp',
      rating: 4.5, reviews: 1540,
      category: 'laptops',
      badges: ['Gaming Pick'],
      lowestEver: 119000,
      specs: {
        'Processor': 'AMD Ryzen 9 7945HX',
        'RAM': '16GB DDR5 4800MHz',
        'Storage': '1TB NVMe SSD',
        'Display': '16" QHD 240Hz IPS Anti-Glare',
        'GPU': 'NVIDIA GeForce RTX 4070',
        'Battery': '90Wh',
        'OS': 'Windows 11 Home',
        'Weight': '2.5 kg'
      },
      prices: [
        { store:'Amazon India', price:124990, mrp:164990, inStock:true,  url:'https://www.amazon.in/ASUS-ROG-Strix-G16', offers:['₹8,000 off with ICICI Card','No Cost EMI'] },
        { store:'Flipkart',     price:127990, mrp:164990, inStock:true,  url:'https://www.flipkart.com/asus-rog-strix-g16', offers:['Flipkart 5% unlimited cashback'] },
        { store:'ASUS Store',   price:129990, mrp:164990, inStock:true,  url:'https://www.asus.com/in/', offers:['1-year extended warranty'] },
        { store:'Croma',        price:132000, mrp:164990, inStock:false, url:'https://www.croma.com/asus-rog' }
      ]
    },
    {
      id: 'lenovo-thinkpad-x1',
      name: 'Lenovo ThinkPad X1 Carbon Gen 11',
      brand: 'Lenovo',
      image: 'https://p1-ofp.static.pub/fes/cms/2022/10/26/05qlk7y4n6t3m8u3e7jyifr93r1kf3580337.png',
      rating: 4.7, reviews: 634,
      category: 'laptops',
      badges: ['Business Choice'],
      lowestEver: 138000,
      specs: {
        'Processor': 'Intel Core i7-1365U vPro',
        'RAM': '16GB LPDDR5',
        'Storage': '512GB PCIe SSD',
        'Display': '14" 2.8K OLED 90Hz',
        'Battery': 'Up to 15 hours',
        'OS': 'Windows 11 Pro',
        'Weight': '1.12 kg',
        'Security': 'Fingerprint + IR camera + TPM 2.0'
      },
      prices: [
        { store:'Lenovo India',  price:149990, mrp:185000, inStock:true, url:'https://www.lenovo.com/in/en/laptops/thinkpad/thinkpad-x1', offers:['Lenovo Pro member discount'] },
        { store:'Amazon India',  price:155000, mrp:185000, inStock:true, url:'https://www.amazon.in/Lenovo-ThinkPad-X1-Carbon', offers:['HDFC Bank 10% off'] },
        { store:'Flipkart',      price:157000, mrp:185000, inStock:true, url:'https://www.flipkart.com/lenovo-thinkpad-x1' }
      ]
    },
    {
      id: 'hp-spectre-x360',
      name: 'HP Spectre x360 14 2-in-1 Laptop',
      brand: 'HP',
      image: 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/knac/c08154630.png',
      rating: 4.6, reviews: 445,
      category: 'laptops',
      lowestEver: 115000,
      specs: {
        'Processor': 'Intel Core Ultra 7 155H',
        'RAM': '16GB LPDDR5x',
        'Storage': '1TB PCIe SSD',
        'Display': '14" 2.8K OLED Touch 120Hz',
        'Battery': 'Up to 17 hours',
        'OS': 'Windows 11 Home',
        'Weight': '1.4 kg'
      },
      prices: [
        { store:'HP India',     price:134990, mrp:159990, inStock:true, url:'https://www.hp.com/in-en/shop/pdp/hp-spectre-x360', offers:['HP Student offer','Trade-in offer available'] },
        { store:'Amazon India', price:138990, mrp:159990, inStock:true, url:'https://www.amazon.in/HP-Spectre-x360', offers:['No Cost EMI'] },
        { store:'Flipkart',     price:139999, mrp:159990, inStock:true, url:'https://www.flipkart.com/hp-spectre-x360' },
        { store:'Croma',        price:142000, mrp:159990, inStock:true, url:'https://www.croma.com/hp-spectre' }
      ]
    }
  ],

  /* ── SMARTPHONES ──────────────────────────────────────────── */
  phones: [
    {
      id: 'iphone-15-pro',
      name: 'Apple iPhone 15 Pro — 256GB Natural Titanium',
      brand: 'Apple',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
      rating: 4.8, reviews: 9821,
      category: 'phones',
      badges: ['Best Seller'],
      lowestEver: 129900,
      specs: {
        'Chipset': 'Apple A17 Pro (3nm)',
        'Display': '6.1" Super Retina XDR ProMotion 120Hz',
        'Rear Camera': '48MP Main + 12MP Ultra Wide + 12MP 3× Tele',
        'Front Camera': '12MP TrueDepth',
        'Battery': '3274 mAh, 23 hrs video',
        'OS': 'iOS 17',
        'Storage': '256GB',
        'Build': 'Titanium frame + textured matte glass'
      },
      prices: [
        { store:'Amazon India',      price:134900, mrp:134900, inStock:true,  url:'https://www.amazon.in/dp/B0C3QCPGGR', offers:['Exchange up to ₹50,000','No Cost EMI from ₹11,242'] },
        { store:'Flipkart',          price:134900, mrp:134900, inStock:true,  url:'https://www.flipkart.com/apple-iphone-15-pro', offers:['Axis Bank 10% off'] },
        { store:'Apple Store India', price:134900, mrp:134900, inStock:true,  url:'https://www.apple.com/in/shop/buy-iphone/iphone-15-pro', offers:['Apple Card Monthly Instalment','Trade In offers'] },
        { store:'Croma',             price:134900, mrp:134900, inStock:true,  url:'https://www.croma.com/apple-iphone-15-pro' },
        { store:'Reliance Digital',  price:134900, mrp:134900, inStock:true,  url:'https://www.reliancedigital.in/apple-iphone-15-pro' }
      ]
    },
    {
      id: 'samsung-s24-ultra',
      name: 'Samsung Galaxy S24 Ultra — 256GB Titanium Black',
      brand: 'Samsung',
      image: 'https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-ultra-s928-sm-s928bzkgins-thumb-539573452',
      rating: 4.7, reviews: 5620,
      category: 'phones',
      badges: ['AI Phone'],
      lowestEver: 124999,
      specs: {
        'Chipset': 'Snapdragon 8 Gen 3',
        'Display': '6.8" QHD+ Dynamic AMOLED 2X 120Hz',
        'Rear Camera': '200MP Main + 50MP 5× Tele + 10MP 3× Tele + 12MP Ultra Wide',
        'Battery': '5000 mAh, 45W fast charge',
        'OS': 'Android 14, One UI 6.1',
        'Storage': '256GB',
        'S Pen': 'Built-in',
        'RAM': '12GB'
      },
      prices: [
        { store:'Samsung Shop', price:124999, mrp:134999, inStock:true, url:'https://www.samsung.com/in/smartphones/galaxy-s24-ultra/', offers:['Galaxy AI features','Up to ₹10,000 cashback'] },
        { store:'Amazon India', price:124999, mrp:134999, inStock:true, url:'https://www.amazon.in/Samsung-Galaxy-S24-Ultra', offers:['No Cost EMI','Exchange up to ₹40,000'] },
        { store:'Flipkart',     price:126999, mrp:134999, inStock:true, url:'https://www.flipkart.com/samsung-galaxy-s24-ultra', offers:['Flipkart Axis Card 5% off'] },
        { store:'Croma',        price:128990, mrp:134999, inStock:true, url:'https://www.croma.com/samsung-galaxy-s24-ultra' }
      ]
    },
    {
      id: 'oneplus-12',
      name: 'OnePlus 12 — 256GB Flowy Emerald',
      brand: 'OnePlus',
      image: 'https://image01.oneplus.net/ebp/202401/09/1-m00-41-e9-rb8bwwwj_lyapnc2aab5y8w7ysaaae4q3w9bqmaab5yq388.png',
      rating: 4.6, reviews: 3120,
      category: 'phones',
      badges: ['Price Drop'],
      lowestEver: 59999,
      specs: {
        'Chipset': 'Snapdragon 8 Gen 3',
        'Display': '6.82" LTPO4 AMOLED 1440p 120Hz',
        'Camera': '50MP Main (Hasselblad) + 48MP Ultra Wide + 64MP 3× Periscope Tele',
        'Battery': '5400 mAh, 100W SUPERVOOC + 50W AirVOOC',
        'OS': 'OxygenOS 14 (Android 14)',
        'Storage': '256GB',
        'RAM': '12GB LPDDR5x'
      },
      prices: [
        { store:'OnePlus India', price:59999, mrp:69999, inStock:true, url:'https://www.oneplus.in/oneplus-12', offers:['Amazon Pay ICICI 5% off','Up to ₹3,000 cashback'] },
        { store:'Amazon India',  price:59999, mrp:69999, inStock:true, url:'https://www.amazon.in/OnePlus-12', offers:['No Cost EMI from ₹5,000/month'] },
        { store:'Flipkart',      price:60999, mrp:69999, inStock:true, url:'https://www.flipkart.com/oneplus-12', offers:['Axis Bank 10% off'] },
        { store:'Croma',         price:62990, mrp:69999, inStock:true, url:'https://www.croma.com/oneplus-12' }
      ]
    },
    {
      id: 'pixel-8-pro',
      name: 'Google Pixel 8 Pro — 128GB Obsidian',
      brand: 'Google',
      image: 'https://lh3.googleusercontent.com/Y5qlr7Z6kPlgMfFZ-bQ2L3b-3PQR7LanSvhxQp1Y5G5-Ov_2PlI0A1I1Y2VzNXuPjZjGJTbX4GNe-JlFSHiE',
      rating: 4.6, reviews: 2340,
      category: 'phones',
      badges: ['AI Camera'],
      lowestEver: 79999,
      specs: {
        'Chipset': 'Google Tensor G3',
        'Display': '6.7" LTPO OLED 1344×2992 120Hz',
        'Camera': '50MP Main + 48MP Ultra Wide + 48MP 5× Tele',
        'Battery': '5050 mAh, 30W wired + 23W wireless',
        'OS': 'Android 14 (7 years updates guaranteed)',
        'Storage': '128GB',
        'RAM': '12GB LPDDR5'
      },
      prices: [
        { store:'Flipkart',     price:79999, mrp:106999, inStock:true, url:'https://www.flipkart.com/google-pixel-8-pro', offers:['Axis Bank 10% off','Exchange up to ₹30,000'] },
        { store:'Amazon India', price:81999, mrp:106999, inStock:true, url:'https://www.amazon.in/Google-Pixel-8-Pro', offers:['No Cost EMI'] },
        { store:'Croma',        price:83990, mrp:106999, inStock:true, url:'https://www.croma.com/google-pixel-8-pro' }
      ]
    }
  ],

  /* ── GAMING ───────────────────────────────────────────────── */
  gaming: [
    {
      id: 'ps5',
      name: 'Sony PlayStation 5 (Disc Edition)',
      brand: 'Sony',
      image: 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-product-thumbnail-01-en-14sep21?$facebook$',
      rating: 4.9, reviews: 18230,
      category: 'gaming',
      badges: ['Most Wanted'],
      lowestEver: 44990,
      specs: {
        'CPU': 'Custom AMD Zen 2, 8-core 3.5GHz',
        'GPU': 'Custom RDNA 2, 10.3 TFLOPs',
        'RAM': '16GB GDDR6',
        'Storage': '825GB NVMe SSD',
        'Optical Drive': 'Ultra HD Blu-ray',
        'Resolution': 'Up to 8K',
        'Frame Rate': 'Up to 120fps',
        'Audio': 'Tempest 3D AudioTech'
      },
      prices: [
        { store:'Amazon India',     price:54990, mrp:54990, inStock:true,  url:'https://www.amazon.in/PlayStation-5-Console/dp/B08FC5L3RG', offers:['No Cost EMI from ₹4,583/month','Alexa-enabled'] },
        { store:'Flipkart',         price:54990, mrp:54990, inStock:true,  url:'https://www.flipkart.com/sony-playstation-5', offers:['Axis Bank 10% off (up to ₹1,500)'] },
        { store:'Sony India',       price:54990, mrp:54990, inStock:true,  url:'https://direct.playstation.com/en-in', offers:['1-year manufacturer warranty'] },
        { store:'Croma',            price:54990, mrp:54990, inStock:false, url:'https://www.croma.com/sony-playstation-5' },
        { store:'Games The Shop',   price:54990, mrp:54990, inStock:true,  url:'https://www.gamesthe.shop/ps5' }
      ]
    },
    {
      id: 'xbox-series-x',
      name: 'Microsoft Xbox Series X — 1TB',
      brand: 'Microsoft',
      image: 'https://cdn-dynmedia-1.microsoft.com/is/image/microsoftcorp/Xbox-Series-X_1000x600?resMode=sharp2&op_usm=1.5,0.65,15,0&wid=1024&hei=615&qlt=100&fmt=png-alpha',
      rating: 4.8, reviews: 7420,
      category: 'gaming',
      badges: ['4K Gaming'],
      lowestEver: 46990,
      specs: {
        'CPU': 'Custom AMD Zen 2, 8-core 3.8GHz',
        'GPU': '12 TFLOPs RDNA 2',
        'RAM': '16GB GDDR6',
        'Storage': '1TB NVMe SSD',
        'Resolution': 'True 4K / 8K Ready',
        'Frame Rate': 'Up to 120fps',
        'Game Pass': 'Xbox Game Pass compatible'
      },
      prices: [
        { store:'Amazon India', price:49990, mrp:49990, inStock:true, url:'https://www.amazon.in/Microsoft-Xbox-Series-X/dp/B08H75RTZ8', offers:['3 months Game Pass Ultimate'] },
        { store:'Flipkart',     price:49990, mrp:49990, inStock:true, url:'https://www.flipkart.com/microsoft-xbox-series-x', offers:['Axis Bank credit card 10% off'] },
        { store:'Croma',        price:49990, mrp:49990, inStock:true, url:'https://www.croma.com/microsoft-xbox-series-x', offers:['EMI from ₹4,166/month'] },
        { store:'Games The Shop', price:50500, mrp:49990, inStock:true, url:'https://www.gamesthe.shop/xbox' }
      ]
    },
    {
      id: 'nintendo-switch-oled',
      name: 'Nintendo Switch OLED Model',
      brand: 'Nintendo',
      image: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_auto/c_scale,w_300/ncom/en_US/products/hardware/nintendo-switch-oled-model/114544-switch-oled-hero',
      rating: 4.7, reviews: 5620,
      category: 'gaming',
      lowestEver: 27990,
      specs: {
        'Display': '7" OLED 1280×720',
        'Battery': '4.5–9 hours',
        'Storage': '64GB + microSD slot',
        'CPU': 'NVIDIA Tegra X1+',
        'RAM': '4GB LPDDR4',
        'Audio': 'Improved speakers',
        'LAN Port': 'Wired LAN port in dock'
      },
      prices: [
        { store:'Amazon India', price:34999, mrp:34999, inStock:true, url:'https://www.amazon.in/Nintendo-Switch-OLED-Model', offers:['No Cost EMI'] },
        { store:'Flipkart',     price:34999, mrp:34999, inStock:true, url:'https://www.flipkart.com/nintendo-switch-oled', offers:['Flipkart Axis cashback'] },
        { store:'Games The Shop', price:35500, mrp:34999, inStock:true, url:'https://www.gamesthe.shop/nintendo' }
      ]
    },
    {
      id: 'asus-rog-ally',
      name: 'ASUS ROG Ally Gaming Handheld — AMD Z1 Extreme',
      brand: 'ASUS ROG',
      image: 'https://dlcdnwebimgs.asus.com/gain/A4D3F0D2-BB5D-4F08-B2A9-9B91688B47AA/w800/fwebp',
      rating: 4.4, reviews: 2130,
      category: 'gaming',
      badges: ['PC Gaming Handheld'],
      lowestEver: 52990,
      specs: {
        'CPU/GPU': 'AMD Ryzen Z1 Extreme (8-core)',
        'RAM': '16GB LPDDR5',
        'Storage': '512GB PCIe 4.0 NVMe',
        'Display': '7" FHD 120Hz IPS',
        'Battery': '40Wh, 65W fast charge',
        'OS': 'Windows 11 Home',
        'Controls': 'Built-in controller, RGB'
      },
      prices: [
        { store:'Amazon India', price:54999, mrp:69990, inStock:true, url:'https://www.amazon.in/ASUS-ROG-Ally', offers:['No Cost EMI','HDFC 5% off'] },
        { store:'Flipkart',     price:56999, mrp:69990, inStock:true, url:'https://www.flipkart.com/asus-rog-ally', offers:['Axis Bank cashback'] },
        { store:'ASUS Store',   price:59990, mrp:69990, inStock:true, url:'https://www.asus.com/in/gaming-handhelds/rog-ally' }
      ]
    },
    {
      id: 'gaming-chair-secretlab',
      name: 'Secretlab TITAN Evo 2022 Gaming Chair',
      brand: 'Secretlab',
      image: 'https://cdn.secretlab.co/media/images/titan-evo-2022-series-thumbnail.jpg',
      rating: 4.7, reviews: 1840,
      category: 'gaming',
      lowestEver: 33000,
      specs: {
        'Material': 'SoftWeave Plus Fabric',
        'Lumbar': 'Adjustable 4-way magnetic lumbar',
        'Armrests': '4-way adjustable (4D)',
        'Recline': '85°–165°',
        'Weight Capacity': '130 kg',
        'Height Range': '5\'4" – 6\'2"'
      },
      prices: [
        { store:'Secretlab India', price:33490, mrp:40490, inStock:true, url:'https://secretlab.co/in/', offers:['Free shipping all India'] },
        { store:'Amazon India',    price:35999, mrp:40490, inStock:true, url:'https://www.amazon.in/Secretlab-TITAN-Evo', offers:['No Cost EMI'] }
      ]
    },
    {
      id: 'corsair-k100',
      name: 'Corsair K100 RGB Mechanical Keyboard',
      brand: 'Corsair',
      image: 'https://assets.corsair.com/image/upload/c_pad,q_auto,h_1024,w_1024/pf/CH-912A01A-NA/04_K100_RGB_NA_DETAIL_OPXWHEEL.webp',
      rating: 4.6, reviews: 980,
      category: 'gaming',
      lowestEver: 14999,
      specs: {
        'Switch': 'Cherry MX Speed Silver',
        'Backlight': 'Per-key RGB + iCUE Edge Lighting',
        'Anti-ghosting': 'Full 100%',
        'Polling Rate': '8000Hz (8× faster)',
        'Media Controls': 'Dedicated volume wheel',
        'Extra Features': 'elgato STREAM DECK Software integration'
      },
      prices: [
        { store:'Amazon India', price:16999, mrp:21999, inStock:true, url:'https://www.amazon.in/Corsair-K100-RGB', offers:['No Cost EMI','HDFC 5% off'] },
        { store:'Flipkart',     price:17499, mrp:21999, inStock:true, url:'https://www.flipkart.com/corsair-k100' },
        { store:'MDcomputers',  price:17990, mrp:21999, inStock:true, url:'https://www.mdcomputers.in/corsair-k100' }
      ]
    }
  ],

  /* ── AUDIO ────────────────────────────────────────────────── */
  audio: [
    {
      id: 'sony-xm5',
      name: 'Sony WH-1000XM5 Wireless Headphones',
      brand: 'Sony',
      image: 'https://sony.scene7.com/is/image/sonyglobalsolutions/WH-1000XM5_B_Product-hero_1?$scale-medium$&fmt=png-alpha',
      rating: 4.8, reviews: 12400,
      category: 'audio',
      badges: ['Best ANC', 'Deal Today'],
      lowestEver: 23990,
      specs: {
        'Driver': '30mm Carbon Fibre Composite',
        'ANC': 'Industry-leading ANC with 8 microphones',
        'Battery': '30 hours (ANC on), 3 min charge = 3 hrs',
        'Multipoint': 'Connect 2 devices simultaneously',
        'Codec': 'LDAC, AAC, SBC',
        'Folds': 'No (sleeker design)',
        'Weight': '250g'
      },
      prices: [
        { store:'Amazon India',     price:24990, mrp:34990, inStock:true, url:'https://www.amazon.in/Sony-WH-1000XM5', offers:['No Cost EMI','Exchange up to ₹3,000'] },
        { store:'Flipkart',         price:26490, mrp:34990, inStock:true, url:'https://www.flipkart.com/sony-wh-1000xm5', offers:['Axis Bank 10% off'] },
        { store:'Sony India',       price:26990, mrp:34990, inStock:true, url:'https://www.sony.co.in/en/headphones/products/wh-1000xm5', offers:['Genuine manufacturer warranty'] },
        { store:'Croma',            price:27990, mrp:34990, inStock:true, url:'https://www.croma.com/sony-wh1000xm5' },
        { store:'Reliance Digital', price:28500, mrp:34990, inStock:true, url:'https://www.reliancedigital.in/sony-wh-1000xm5' }
      ]
    },
    {
      id: 'airpods-pro-2',
      name: 'Apple AirPods Pro (2nd Gen) USB-C',
      brand: 'Apple',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MTJV3?wid=2000&hei=2000&fmt=jpeg&qlt=90&.v=1694014871985',
      rating: 4.7, reviews: 8900,
      category: 'audio',
      badges: ['Apple Pick'],
      lowestEver: 21900,
      specs: {
        'Chip': 'Apple H2',
        'ANC': 'Adaptive Audio, Conversation Awareness',
        'Battery': '6 hours (30 hours with case)',
        'Charging': 'USB-C + MagSafe + Apple Watch charger',
        'Water Resistance': 'IP54',
        'Find My': 'Precision Finding',
        'Spatial Audio': 'Personalised + Dynamic Head Tracking'
      },
      prices: [
        { store:'Amazon India',      price:22900, mrp:26900, inStock:true, url:'https://www.amazon.in/Apple-AirPods-Pro-USB-C', offers:['No Cost EMI','Exchange offer'] },
        { store:'Apple Store India', price:26900, mrp:26900, inStock:true, url:'https://www.apple.com/in/shop/buy-airpods', offers:['Student discount','AppleCare+ available'] },
        { store:'Flipkart',          price:23500, mrp:26900, inStock:true, url:'https://www.flipkart.com/apple-airpods-pro-2', offers:['Axis Bank 10% off'] },
        { store:'Croma',             price:24990, mrp:26900, inStock:true, url:'https://www.croma.com/apple-airpods-pro-2' }
      ]
    }
  ],

  /* ── SMART TVs ────────────────────────────────────────────── */
  tvs: [
    {
      id: 'lg-oled-c3',
      name: 'LG C3 55" OLED evo 4K Smart TV',
      brand: 'LG',
      image: 'https://www.lg.com/in/images/tvs/md07552059/gallery/D-01.jpg',
      rating: 4.8, reviews: 4230,
      category: 'tvs',
      badges: ['Editor\'s Pick'],
      lowestEver: 89990,
      specs: {
        'Panel': 'OLED evo (Self-lit pixels)',
        'Resolution': '4K UHD 3840×2160',
        'Refresh Rate': '120Hz (VRR, ALLM)',
        'HDR': 'Dolby Vision IQ, HDR10, HLG',
        'Audio': 'Dolby Atmos 2.2ch 40W',
        'Smart OS': 'webOS 23',
        'Gaming': 'HDMI 2.1, G-Sync, FreeSync Premium',
        'HDMI Ports': '4× HDMI 2.1'
      },
      prices: [
        { store:'Amazon India', price:114990, mrp:169990, inStock:true, url:'https://www.amazon.in/LG-C3-OLED-55', offers:['No Cost EMI from ₹9,583/month','Exchange up to ₹15,000'] },
        { store:'Flipkart',     price:117990, mrp:169990, inStock:true, url:'https://www.flipkart.com/lg-oled-c3-55', offers:['Axis Bank 5% off'] },
        { store:'LG India',     price:119990, mrp:169990, inStock:true, url:'https://www.lg.com/in/tvs/', offers:['3-year panel warranty'] },
        { store:'Croma',        price:122990, mrp:169990, inStock:false, url:'https://www.croma.com/lg-oled-c3' }
      ]
    },
    {
      id: 'samsung-qled-q80c',
      name: 'Samsung 55" Q80C QLED 4K Smart TV',
      brand: 'Samsung',
      image: 'https://image-us.samsung.com/SamsungUS/home/televisions-home-theater/televisions/02122023/Samsung_Q80C_2023_thumbnail.png',
      rating: 4.6, reviews: 2810,
      category: 'tvs',
      lowestEver: 74990,
      specs: {
        'Panel': 'QLED (Quantum Dot)',
        'Resolution': '4K UHD',
        'Refresh Rate': '120Hz with Motion Xcelerator',
        'HDR': 'Quantum HDR+',
        'Audio': 'Dolby Atmos 2.2.2ch 60W',
        'Smart OS': 'Tizen',
        'Gaming': 'HDMI 2.1, FreeSync Premium Pro'
      },
      prices: [
        { store:'Amazon India',  price:87990, mrp:134990, inStock:true, url:'https://www.amazon.in/Samsung-Q80C-QLED', offers:['No Cost EMI','Exchange offer'] },
        { store:'Samsung India', price:89990, mrp:134990, inStock:true, url:'https://www.samsung.com/in/tvs/qled/', offers:['SmartThings ecosystem'] },
        { store:'Flipkart',      price:90990, mrp:134990, inStock:true, url:'https://www.flipkart.com/samsung-q80c', offers:['Axis Bank 10% off'] },
        { store:'Croma',         price:93990, mrp:134990, inStock:true, url:'https://www.croma.com/samsung-q80c' }
      ]
    }
  ],

  /* ── HOME APPLIANCES ──────────────────────────────────────── */
  appliances: [
    {
      id: 'dyson-v15',
      name: 'Dyson V15 Detect Absolute Cordless Vacuum',
      brand: 'Dyson',
      image: 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/447393-01.png',
      rating: 4.7, reviews: 1640,
      category: 'appliances',
      badges: ['Top Rated'],
      lowestEver: 54900,
      specs: {
        'Suction': '230 AW',
        'Battery': '60 minutes',
        'Filtration': 'HEPA + Activated Carbon',
        'Sensor': 'Laser Dust Detection',
        'LCD Display': 'Real-time particle count',
        'Weight': '3.1 kg',
        'HEPA': 'Whole-machine HEPA filtration'
      },
      prices: [
        { store:'Amazon India', price:62900, mrp:72900, inStock:true, url:'https://www.amazon.in/Dyson-V15-Detect-Absolute', offers:['No Cost EMI','Exchange offer'] },
        { store:'Dyson India',  price:66900, mrp:72900, inStock:true, url:'https://www.dyson.in/vacuums/cordless', offers:['2-year manufacturer warranty','Free accessories'] },
        { store:'Flipkart',     price:64900, mrp:72900, inStock:true, url:'https://www.flipkart.com/dyson-v15', offers:['Axis Bank 10% off'] },
        { store:'Croma',        price:67990, mrp:72900, inStock:true, url:'https://www.croma.com/dyson-v15' }
      ]
    },
    {
      id: 'lg-washing-machine',
      name: 'LG 8 Kg 5-Star Inverter Washing Machine',
      brand: 'LG',
      image: 'https://www.lg.com/in/images/washing-machines/md07563259/gallery/DLD-01.jpg',
      rating: 4.5, reviews: 3210,
      category: 'appliances',
      lowestEver: 28990,
      specs: {
        'Capacity': '8 kg',
        'Type': 'Front Load',
        'Star Rating': '5-Star (BEE)',
        'Motor': 'Inverter Direct Drive Motor',
        'Programs': '14 wash programs',
        'Steam': 'TurboWash 360° with Steam',
        'Warranty': '2 years comprehensive + 10 years motor'
      },
      prices: [
        { store:'Amazon India', price:32990, mrp:48990, inStock:true, url:'https://www.amazon.in/LG-8-kg-Inverter', offers:['No Cost EMI','Free installation'] },
        { store:'Flipkart',     price:33990, mrp:48990, inStock:true, url:'https://www.flipkart.com/lg-8-kg-washing-machine', offers:['Free delivery + install'] },
        { store:'LG India',     price:36990, mrp:48990, inStock:true, url:'https://www.lg.com/in/washing-machines/', offers:['10-year motor warranty'] },
        { store:'Croma',        price:35990, mrp:48990, inStock:true, url:'https://www.croma.com/lg-washing-machine' }
      ]
    }
  ],

  /* ── MEN'S FASHION ────────────────────────────────────────── */
  'fashion-men': [
    {
      id: 'levis-501',
      name: "Levi's 501 Original Fit Men's Jeans — Dark Wash",
      brand: "Levi's",
      image: 'https://lsco.scene7.com/is/image/lsco/00501-0193-hero?fmt=jpeg&qlt=70&resMode=bisharp&fit=crop,0&op_usm=0.6,0.6,8&wid=480&hei=560',
      rating: 4.5, reviews: 8920,
      category: 'fashion-men',
      lowestEver: 1999,
      specs: {
        'Fit': 'Original Straight Fit',
        'Material': '100% Cotton Denim',
        'Rise': 'Mid Rise',
        'Closure': 'Button fly',
        'Available Sizes': '28–44 × 28–36',
        'Care': 'Machine washable'
      },
      prices: [
        { store:'Myntra',       price:2999, mrp:4799, inStock:true, url:'https://www.myntra.com/levis-501-jeans', offers:['Bank of Baroda 10% off','Size exchange free'] },
        { store:"Levi's India", price:3399, mrp:4799, inStock:true, url:'https://www.levi.in/men/jeans/501-original-fit', offers:['Free shipping on orders ₹2,500+'] },
        { store:'Amazon India', price:3199, mrp:4799, inStock:true, url:'https://www.amazon.in/Levis-501-Jeans', offers:['Prime free delivery'] },
        { store:'Ajio',         price:2849, mrp:4799, inStock:true, url:'https://www.ajio.com/levis-501', offers:['30% off with AJIO code'] }
      ]
    },
    {
      id: 'polo-ralph-lauren',
      name: 'Ralph Lauren Polo Classic Fit T-Shirt',
      brand: 'Ralph Lauren',
      image: 'https://polo-ralph-lauren.scene7.com/is/image/PoloRalphLauren/710671438017_A1?$plpProduct$',
      rating: 4.6, reviews: 4320,
      category: 'fashion-men',
      lowestEver: 2499,
      specs: {
        'Material': '100% Cotton Jersey',
        'Fit': 'Custom Slim Fit',
        'Collar': 'Polo collar with 2-button placket',
        'Logo': 'Embroidered Polo Pony',
        'Sizes': 'XS – 3XL',
        'Care': 'Machine wash cold'
      },
      prices: [
        { store:'Myntra',       price:3499, mrp:6999, inStock:true, url:'https://www.myntra.com/ralph-lauren-polo', offers:['Flat 50% off sale'] },
        { store:'Amazon India', price:3899, mrp:6999, inStock:true, url:'https://www.amazon.in/Ralph-Lauren-Polo', offers:['Prime eligible'] },
        { store:'Ajio',         price:3299, mrp:6999, inStock:true, url:'https://www.ajio.com/ralph-lauren' }
      ]
    }
  ],

  /* ── WOMEN'S FASHION ──────────────────────────────────────── */
  'fashion-women': [
    {
      id: 'zara-blazer',
      name: 'Zara Double Breasted Blazer — Off White',
      brand: 'Zara',
      image: 'https://static.zara.net/assets/public/33a3/d9ab/96434af3ac6e/9d0d73cbf8af/02248300712-e1/02248300712-e1.jpg?ts=1713440012022&w=750',
      rating: 4.4, reviews: 2140,
      category: 'fashion-women',
      lowestEver: 4990,
      specs: {
        'Material': 'Polyester blend',
        'Fit': 'Regular fit',
        'Closure': 'Double breasted buttons',
        'Pockets': '2 front pockets + 1 chest pocket',
        'Sizes': 'XS – XL',
        'Care': 'Dry clean recommended'
      },
      prices: [
        { store:'Zara India',   price:5990, mrp:7990, inStock:true, url:'https://www.zara.com/in/', offers:['Free returns in-store'] },
        { store:'Myntra',       price:5590, mrp:7990, inStock:true, url:'https://www.myntra.com/zara-blazer', offers:['Bank of Baroda 10% off'] },
        { store:'Ajio',         price:5390, mrp:7990, inStock:true, url:'https://www.ajio.com/zara', offers:['15% off on first order'] }
      ]
    },
    {
      id: 'hm-dress',
      name: 'H&M Floral Wrap Midi Dress',
      brand: 'H&M',
      image: 'https://lp2.hm.com/hmgoepprod?set=source[/11/1c/111c1f0cddab4d2b3bcc1e45dde6b4a6af9fb4c5.jpg],origin[dam],category[ladies_dresses_wrapshortdresses],type[LOOKBOOK],res[m],hmver[2]&call=url[file:/product/main]',
      rating: 4.3, reviews: 1820,
      category: 'fashion-women',
      lowestEver: 1299,
      specs: {
        'Material': 'Viscose',
        'Length': 'Midi',
        'Neckline': 'V-neck with wrap design',
        'Sleeves': 'Short sleeves',
        'Sizes': 'XS – 2XL',
        'Care': 'Machine wash 30°'
      },
      prices: [
        { store:'H&M India',    price:1999, mrp:2999, inStock:true, url:'https://www2.hm.com/en_in/', offers:['H&M Club extra 10% off'] },
        { store:'Myntra',       price:1799, mrp:2999, inStock:true, url:'https://www.myntra.com/h-m-dress', offers:['30% off'] },
        { store:'Ajio',         price:1699, mrp:2999, inStock:true, url:'https://www.ajio.com/hm', offers:['AJIO first order 15% off'] }
      ]
    }
  ],

  /* ── SHOES ────────────────────────────────────────────────── */
  shoes: [
    {
      id: 'nike-air-max-270',
      name: 'Nike Air Max 270 — Black/White',
      brand: 'Nike',
      image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png',
      rating: 4.6, reviews: 5420,
      category: 'shoes',
      badges: ['Best Seller'],
      lowestEver: 8995,
      specs: {
        'Upper': 'Mesh + synthetic overlay',
        'Midsole': 'Foam + 270° Max Air unit',
        'Outsole': 'Rubber with waffle traction',
        'Heel Height': '32mm Air unit (tallest yet)',
        'Sizes': 'UK 6 – 12',
        'Suitable For': 'Lifestyle / Casual'
      },
      prices: [
        { store:'Nike India',   price:10795, mrp:10795, inStock:true, url:'https://www.nike.com/in/t/air-max-270', offers:['Nike Member free delivery','15% off with Nike App'] },
        { store:'Myntra',       price:9995,  mrp:10795, inStock:true, url:'https://www.myntra.com/nike-air-max-270', offers:['Bank discount 10% off'] },
        { store:'Amazon India', price:9499,  mrp:10795, inStock:true, url:'https://www.amazon.in/Nike-Air-Max-270', offers:['Prime eligible','No Cost EMI'] },
        { store:'Flipkart',     price:9799,  mrp:10795, inStock:true, url:'https://www.flipkart.com/nike-air-max-270', offers:['Axis Bank 10% off'] },
        { store:'Ajio',         price:9299,  mrp:10795, inStock:true, url:'https://www.ajio.com/nike-air-max-270', offers:['Ajio 15% off sitewide'] }
      ]
    },
    {
      id: 'adidas-ultraboost',
      name: 'Adidas Ultraboost 23 Running Shoes',
      brand: 'Adidas',
      image: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/7bed66d34d3d48e0b71cae7200f50609_9366/Ultraboost_23_Shoes_Black_ID3434_01_standard.jpg',
      rating: 4.7, reviews: 3810,
      category: 'shoes',
      lowestEver: 11999,
      specs: {
        'Upper': 'Primeknit+ textile',
        'Midsole': 'BOOST midsole (50% recycled content)',
        'Outsole': 'Continental Rubber',
        'Drop': '10mm',
        'Weight': '310g (UK 8.5)',
        'Sizes': 'UK 6 – 13',
        'Suitable For': 'Road Running'
      },
      prices: [
        { store:'Adidas India', price:14999, mrp:19999, inStock:true, url:'https://www.adidas.co.in/ultraboost-23', offers:['25% off sale'] },
        { store:'Amazon India', price:12999, mrp:19999, inStock:true, url:'https://www.amazon.in/Adidas-Ultraboost-23', offers:['Prime free shipping'] },
        { store:'Myntra',       price:12499, mrp:19999, inStock:true, url:'https://www.myntra.com/adidas-ultraboost', offers:['Bank discount','Easy returns'] },
        { store:'Flipkart',     price:12999, mrp:19999, inStock:true, url:'https://www.flipkart.com/adidas-ultraboost' }
      ]
    },
    {
      id: 'red-tape-formal',
      name: 'Red Tape Men\'s Leather Oxford Formal Shoes',
      brand: 'Red Tape',
      image: 'https://images.meesho.com/images/products/190736640/x4lgh_512.webp',
      rating: 4.3, reviews: 2340,
      category: 'shoes',
      lowestEver: 999,
      specs: {
        'Upper': 'Genuine Leather',
        'Sole': 'Rubber / TPR',
        'Closure': 'Lace-up',
        'Toe Shape': 'Round / Pointed',
        'Sizes': 'UK 6 – 11',
        'Suitable For': 'Formal/Office'
      },
      prices: [
        { store:'Meesho',       price:1249, mrp:3999, inStock:true, url:'https://www.meesho.com/red-tape-oxford', offers:['Free delivery'] },
        { store:'Amazon India', price:1599, mrp:3999, inStock:true, url:'https://www.amazon.in/Red-Tape-Oxford', offers:['Prime eligible'] },
        { store:'Flipkart',     price:1399, mrp:3999, inStock:true, url:'https://www.flipkart.com/red-tape-formal' },
        { store:'Myntra',       price:1499, mrp:3999, inStock:true, url:'https://www.myntra.com/red-tape' }
      ]
    }
  ],

  /* ── CAMERAS ──────────────────────────────────────────────── */
  cameras: [
    {
      id: 'sony-a7iv',
      name: 'Sony Alpha A7 IV Full-Frame Mirrorless Camera',
      brand: 'Sony',
      image: 'https://www.bhphotovideo.com/images/images2500x2500/sony_ilce_7m4_k_alpha_a7_iv_mirrorless_1668957.jpg',
      rating: 4.8, reviews: 2840,
      category: 'cameras',
      badges: ['Hybrid Champion'],
      lowestEver: 199990,
      specs: {
        'Sensor': '33MP Full-Frame BSI CMOS',
        'Processor': 'BIONZ XR',
        'Autofocus': '759-point Phase Detect AF',
        'Video': '4K 60fps, 12-bit RAW',
        'Stabilisation': '5-axis IBIS (5.5 stops)',
        'Buffer': '828 JPEG / 96 RAW',
        'Connectivity': 'Wi-Fi 6, Bluetooth 5.0, USB-C'
      },
      prices: [
        { store:'Amazon India', price:219990, mrp:269990, inStock:true, url:'https://www.amazon.in/Sony-Alpha-A7-IV', offers:['No Cost EMI from ₹18,333/month'] },
        { store:'Flipkart',     price:224990, mrp:269990, inStock:true, url:'https://www.flipkart.com/sony-a7iv', offers:['Axis Bank 10% off'] },
        { store:'Sony India',   price:229990, mrp:269990, inStock:true, url:'https://www.sony.co.in/en/articles/ilce-7m4', offers:['Genuine warranty + cashback'] }
      ]
    }
  ],

  /* ── TABLETS ──────────────────────────────────────────────── */
  tablets: [
    {
      id: 'ipad-pro-m4',
      name: 'Apple iPad Pro 13" M4 — 256GB Wi-Fi',
      brand: 'Apple',
      image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202405?wid=940&hei=1112&fmt=png-alpha&.v=1713568012953',
      rating: 4.9, reviews: 3210,
      category: 'tablets',
      badges: ['M4 Chip'],
      lowestEver: 107900,
      specs: {
        'Chip': 'Apple M4 (3nm)',
        'Display': '13" Ultra Retina XDR OLED 2752×2064',
        'RAM': '8GB (base)',
        'Storage': '256GB',
        'Camera': '12MP Wide + 10MP Ultra Wide',
        'Battery': '10 hours',
        'Pencil': 'Apple Pencil Pro (sold separately)'
      },
      prices: [
        { store:'Amazon India',      price:118900, mrp:118900, inStock:true, url:'https://www.amazon.in/Apple-iPad-Pro-M4', offers:['No Cost EMI','Exchange up to ₹25,000'] },
        { store:'Apple Store India', price:118900, mrp:118900, inStock:true, url:'https://www.apple.com/in/shop/buy-ipad/ipad-pro', offers:['Student discount','Trade In'] },
        { store:'Flipkart',          price:117999, mrp:118900, inStock:true, url:'https://www.flipkart.com/apple-ipad-pro-m4', offers:['Axis Bank 5% off'] },
        { store:'Croma',             price:119990, mrp:118900, inStock:true, url:'https://www.croma.com/apple-ipad-pro-m4' }
      ]
    }
  ]
};

// Convenience lookup
window.PRODUCTS_FLAT = Object.values(PRODUCTS).flat();
window.PRODUCTS      = PRODUCTS;
