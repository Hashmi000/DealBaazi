import requests
from bs4 import BeautifulSoup
import sys
import time
import random

# List of headers to bypass basic Amazon bot protection
HEADERS_LIST = [
    {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"},
    {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"},
    {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"}
]

def check_price(url, target_price):
    headers = random.choice(HEADERS_LIST)
    headers['Accept-Language'] = 'en-US, en;q=0.5'
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code != 200:
            print(f"[ERROR] Failed to fetch {url} - Status Code: {response.status_code}")
            return

        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Scrape Title
        title_elem = soup.find(id='productTitle')
        title = title_elem.get_text().strip() if title_elem else "Unknown Product"

        # Scrape Price (Amazon India uses .a-price-whole and spans)
        price_elem = soup.find('span', {'class': 'a-price-whole'})
        if not price_elem:
            # Fallback for deal prices
            price_elem = soup.find('span', {'id': 'priceblock_ourprice'})
            
        if not price_elem:
            print(f"[WARNING] Could not find price for {title}. Page structure might have changed or CAPTCHA triggered.")
            return

        price_str = price_elem.get_text().replace(',', '').replace('₹', '').replace('.', '').strip()
        current_price = float(price_str)

        print(f"[{title}] Current Price: ₹{current_price} (Target: ₹{target_price})")

        if current_price <= target_price:
            print(f"🎉 PRICE DROP ALERT! {title} is now ₹{current_price}!")
            # Future Implementation: Trigger Email via Node.js API or send SMS
            
    except Exception as e:
        print(f"[ERROR] Exception checking {url}: {str(e)}")

if __name__ == '__main__':
    """
    Usage: python price_tracker.py <target_price> <amazon_url>
    Example: python price_tracker.py 50000 "https://www.amazon.in/dp/B0CX..."
    """
    if len(sys.argv) < 3:
        print("Usage: python price_tracker.py <target_price> <amazon_url>")
        sys.exit(1)
        
    try:
        target = float(sys.argv[1])
        url = sys.argv[2]
        check_price(url, target)
    except ValueError:
        print("Invalid target price.")
        sys.exit(1)
