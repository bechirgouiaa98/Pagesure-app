from flask import Flask, request, jsonify
from flask_cors import CORS
from apify_client import ApifyClient
import os

app = Flask(__name__)
CORS(app, origins=['https://pagesure-frontend-app.onrender.com'])

APIFY_TOKEN = os.environ.get("APIFY_TOKEN") or "YOUR_APIFY_TOKEN"  # Replace with your token or set in Render
TASK_ID = "bechir.gouiaa98/facebook-scraper-task"

def scrape_facebook_data(url):
    client = ApifyClient(APIFY_TOKEN)
    run = client.task(TASK_ID).call({"startUrls": [{"url": url}]})
    items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
    if not items:
        return {"error": "No data found"}
    return items[0]

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
