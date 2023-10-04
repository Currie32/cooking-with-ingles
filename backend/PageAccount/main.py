import json
import logging

from firebase_admin import credentials, firestore, initialize_app
from flask import Flask

# Use certificate to connect to the database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)


@app.route('/delete_user', methods=['OPTIONS', 'POST'])
def delete_user(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS, POST',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        }
        return (json.dumps(['']), 204, headers)

    uid = validate_request(request)
    headers = {'Access-Control-Allow-Origin': '*'}

    if not uid:
        response = json.dumps({'data': {'error': 'Invalid request data.'}})
        return (response, 400, headers)

    db.collection('users').document(uid).delete()
    db.collection('users_cookbooks').document(uid).delete()

    response = json.dumps({'data': 'success'})
    return (response, 200, headers)


def validate_request(request):
    try:
        request_data = request.get_json()
        logger.info(request_data)
        uid = request_data['data']['uid']
        return uid
    except (KeyError, TypeError):
        return None
