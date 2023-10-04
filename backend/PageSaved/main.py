import json
import logging

from firebase_admin import credentials, firestore, initialize_app
from flask import Flask
from recipe_scrapers import scrape_me

# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)


@app.route('/read-recipes', methods=['GET', 'OPTIONS'])
def read_recipes(request):
    if request.method == 'OPTIONS':
        return handle_options_request('GET')

    request_parsed = request.get_json()
    logger.info(request_parsed)
    uid = request_parsed['data']['uid']

    data = db.collection('users').document(uid).get().to_dict()
    data = eval(str(data).replace('\\\\u00bd', '1/2').replace('\\\\u00bc', '1/4'))

    response = json.dumps({'data': data})
    headers = {'Access-Control-Allow-Origin': '*'}
    return (response, 200, headers)


@app.route('/add-recipe', methods=['OPTIONS', 'POST'])
def add_recipe(request):
    if request.method == 'OPTIONS':
        return handle_options_request('POST')

    request_parsed = request.get_json()
    logger.info(request_parsed)
    url = request_parsed['data']['url']
    uid = request_parsed['data']['uid']

    user_recipes = db.collection('users').document(uid).get().to_dict()

    success = True

    try:
        scraper = scrape_me(url, wild_mode=True)
        title = scraper.title()
        cuisine = scraper.cuisine() if scraper.cuisine() else None
        nutrients = scraper.nutrients() if scraper.nutrients() else None
        total_time = scraper.total_time() if scraper.total_time() else None

        user_recipes[title] = {
            "cuisine": cuisine,
            "title": title,
            "ingredients": scraper.ingredients(),
            "instructions": scraper.instructions().split('\n'),
            "image": scraper.image(),
            "nutrients": nutrients,
            "total_time": total_time,
            "url": scraper.canonical_url()
        }
        doc_ref = db.collection('users').document(uid)
        doc_ref.set(user_recipes)
    except:
        success = False

    response = json.dumps({'data': {
        'recipes': user_recipes,
        'success': success
    }})
    headers = {'Access-Control-Allow-Origin': '*'}
    return (response, 200, headers)


@app.route('/delete_recipe', methods=['OPTIONS', 'POST'])
def delete_recipe(request):
    """
    Remove a recipe from the user's data by uploading all by the recipe to be deleted.
    """
    if request.method == 'OPTIONS':
        return handle_options_request('POST')

    request_parsed = request.get_json()
    logger.info(request_parsed)
    recipes = request_parsed['data']['recipes']
    uid = request_parsed['data']['uid']

    doc_ref = db.collection('users').document(uid)
    doc_ref.set(recipes)

    response = json.dumps({'data': 'success'})
    headers = {'Access-Control-Allow-Origin': '*'}
    return (response, 200, headers)


def handle_options_request(method):
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': f'OPTIONS, {method}',
        'Access-Control-Allow-Headers': ['*', 'Content-Type', 'Authorization'],
        'Access-Control-Max-Age': '3600'
    }
    return (json.dumps(['']), 204, cors_headers)
