import json
import logging
from flask import Flask, request

from firebase_admin import credentials, firestore, initialize_app


# Initialize Flask app
app = Flask(__name__)

# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)


@app.route('/save-user-cookbooks', methods=['GET', 'OPTIONS'])
def read_user_cookbooks(request):
    if request.method == 'OPTIONS':
        return handle_options_request('GET')

    request_parsed = request.get_json()
    logger.info(request_parsed)
    uid = request_parsed['data']['uid']

    # Fetch user's cookbooks from Firestore
    user_cookbooks = db.collection('users_cookbooks').document(uid).get().to_dict()
    cookbooks = user_cookbooks.get('cookbooks', [])

    response = json.dumps({'data': cookbooks})
    headers = {'Access-Control-Allow-Origin': '*'}
    return (response, 200, headers)


@app.route('/save-user-cookbooks', methods=['OPTIONS', 'POST'])
def save_user_cookbooks(request):
    if request.method == 'OPTIONS':
        return handle_options_request('POST')

    request_parsed = request.get_json()
    logger.info(request_parsed)
    uid = request_parsed['data']['uid']
    cookbooks = request_parsed['data']['cookbooks']

    # Save user's cookbooks
    db.collection('users_cookbooks').document(uid).set({"cookbooks": cookbooks})

    # Prepare response with the "data" key
    response = json.dumps({'data': 'success'})
    headers = {'Access-Control-Allow-Origin': '*'}
    return (response, 200, headers)


def handle_options_request(method):
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': f'{method}, OPTIONS',
        'Access-Control-Allow-Headers': ['*', 'Content-Type', 'Authorization'],
        'Access-Control-Max-Age': '3600'
    }
    return (json.dumps(['']), 204, cors_headers)
