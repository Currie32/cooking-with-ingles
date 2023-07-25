import logging

from firebase_admin import credentials, firestore, initialize_app
from flask import Flask, request, jsonify

# Use certificate to connect to the database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

app = Flask(__name__)

logger = logging.getLogger()


def validate_request(request):
    try:
        request_data = request.get_json()
        logger.info(request_data)
        uid = request_data['data']['uid']
        return uid
    except (KeyError, TypeError):
        return None

@app.route('/delete_user', methods=['POST', 'OPTIONS'])
def delete_user(request):
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)

    uid = validate_request(request)
    if not uid:
        return jsonify({'error': 'Invalid request data.'}), 400

    try:
        db.collection('users').document(uid).delete()
        db.collection('users_cookbooks').document(uid).delete()

        response = {'data': 'success'}
        return jsonify(response), 200
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        return jsonify({'error': 'Internal server error.'}), 500

if __name__ == '__main__':
    app.run()
