import json
import logging

from firebase_admin import credentials, firestore, initialize_app
from flask import Flask


# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)


@app.route('/add-recipe', methods=['OPTIONS', 'POST'])
def add_default_recipes(request):
    if request.method == 'OPTIONS':
        return handle_options_request()

    request_parsed = request.get_json()
    logger.info(request_parsed)
    uid = request_parsed['data']['uid']

    with open('default_recipes.json') as default_recipes_file:
        default_recipes_data = json.load(default_recipes_file)
        doc_ref = db.collection('users').document(uid)
        doc_ref.set(default_recipes_data)

    response = json.dumps({'data': 'success'})
    headers = {'Access-Control-Allow-Origin': '*'}
    return (response, 200, headers)


def handle_options_request():
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST',
        'Access-Control-Allow-Headers': ['*', 'Content-Type', 'Authorization'],
        'Access-Control-Max-Age': '3600'
    }
    return (json.dumps(['']), 204, cors_headers)
