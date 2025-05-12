from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
import re
import time

app = Flask(__name__)
CORS(app, origins=['https://pagesure-frontend-app.onrender.com'])

SCRAPERAPI_KEY = "7b1303de5020c81ea379b846702da268"  # For production, use an environment variable

def scrape_facebook_data(url):
    print(f"[DEBUG] Scraping Facebook URL: {url}")
    api_url = f"https://api.scraperapi.com/?api_key={SCRAPERAPI_KEY}&url={url}"
    print(f"[DEBUG] ScraperAPI request: {api_url}")
    response = requests.get(api_url)
    response.raise_for_status()
    html = response.text

    soup = BeautifulSoup(html, 'html.parser')

    # Logo image (SVG or image tag)
    logo_img = soup.select_one('image')
    # Followers
    followers_tag = soup.find('a', string=re.compile(r' followers$'))
    # Page name (from <title>)
    title_tag = soup.find('title')
    page_name = "N/A"
    if title_tag:
        title_text = title_tag.text.strip()
        title_text = re.split(r'\||-', title_text)[0].strip()
        title_text = title_text.replace('Facebook', '').strip()
        page_name = title_text

    data = {
        "logo_image": logo_img['xlink:href'] if logo_img else None,
        "page_name": page_name,
        "followers": followers_tag.get_text() if followers_tag else "N/A"
    }
    return data

@app.route('/api/scrape', methods=['POST'])
def scrape():
    req_data = request.get_json()
    url = req_data.get('url')
    if not url or 'facebook.com' not in url:
        return jsonify({'error': 'Invalid Facebook URL'}), 400

    try:
        data = scrape_facebook_data(url)
        return jsonify(data)
    except Exception as e:
        import traceback
        print('--- Exception in /api/scrape ---')
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 
