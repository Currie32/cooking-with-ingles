import json

from firebase_admin import credentials, firestore, initialize_app

# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()


def read_recipes(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': ['*', 'Content-Type', 'Authorization'],
            'Access-Control-Max-Age': '3600'
        }
        return (json.dumps(['']), 204, headers)

    data = db.collection('users').document('dave').get().to_dict()

    # Need the key "data" in the return object
    response = json.dumps({'data': data})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)
