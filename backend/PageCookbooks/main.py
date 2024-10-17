import json
import logging
import pickle

from firebase_admin import credentials, firestore, initialize_app
from flask import Flask

# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)


@app.route('/read-cookbooks', methods=['GET', 'OPTIONS'])
def read_cookbook(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': ['*', 'Content-Type', 'Authorization'],
            'Access-Control-Max-Age': '3600'
        }
        return (json.dumps(['']), 204, headers)

    request_parsed = request.get_json()
    logger.info(request_parsed)
    cookbook = request_parsed['data']['cookbook']

    with open('./recipes.pickle', 'rb') as fh:
        recipes = pickle.load(fh)

    recipes = [r for r in recipes if r['book'] in cookbook]
    response = {'recipes': recipes}

    # Need the key "data" in the return object
    response = json.dumps({'data': response})
    headers = {'Access-Control-Allow-Origin': '*'}
    return (response, 200, headers)
