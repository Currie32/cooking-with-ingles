import json
import logging

from firebase_admin import credentials, firestore, initialize_app
from recipe_scrapers import scrape_me

# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

logger = logging.getLogger()


def read_recipes(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': ['*', 'Content-Type', 'Authorization'],
            'Access-Control-Max-Age': '3600'
        }
        return (json.dumps(['']), 204, headers)

    request_parsed = request.get_json()
    logger.info(request_parsed)
    uid = request_parsed['data']['uid']

    data = db.collection('users').document(uid).get().to_dict()

    data = eval(str(data).replace('\\\\u00bd', '1/2').replace('\\\\u00bc', '1/4'))

    # Need the key "data" in the return object
    response = json.dumps({'data': data})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)


def add_recipe(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': ['*', 'Content-Type', 'Authorization'],
            'Access-Control-Max-Age': '3600'
        }
        return (json.dumps(['']), 204, headers)

    request_parsed = request.get_json()
    logger.info(request_parsed)
    url = request_parsed['data']['url']
    uid = request_parsed['data']['uid']

    data = db.collection('users').document(uid).get().to_dict()

    success = True

    try:
        scraper = scrape_me(url, wild_mode=True)

        title = scraper.title()

        try:
            cuisine = scraper.cuisine()
        except:
            cuisine = False

        try:
            nutrients = scraper.nutrients()
        except:
            nutrients = False

        try:
            total_time = scraper.total_time()
        except:
            total_time = False

        data[title] = {
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
        doc_ref.set(data)
    except:
        success = False

    # Need the key "data" in the return object
    response = json.dumps({'data': {
        'recipes': data,
        'success': success
    }})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)


def delete_recipe(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': ['*', 'Content-Type', 'Authorization'],
            'Access-Control-Max-Age': '3600'
        }
        return (json.dumps(['']), 204, headers)

    request_parsed = request.get_json()
    logger.info(request_parsed)
    recipes = request_parsed['data']['recipes']
    uid = request_parsed['data']['uid']

    doc_ref = db.collection('users').document(uid)
    doc_ref.set(recipes)

    # Need the key "data" in the return object
    response = json.dumps({'data': 'success'})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)
