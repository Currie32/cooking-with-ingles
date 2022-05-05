import json
import logging

from firebase_admin import credentials, firestore, initialize_app


# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

logger = logging.getLogger()


def add_default_recipes(request):
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

    file = open('data.json')
    data = json.load(file)

    doc_ref = db.collection('users').document(uid)
    doc_ref.set(data)

    # Need the key "data" in the return object
    response = json.dumps({'data': 'success'})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)
