import json
import logging
import os
import requests

import openai
from firebase_admin import credentials, firestore, initialize_app
from flask import Flask
from tenacity import retry, stop_after_attempt, wait_random_exponential

# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()
openai.api_key = os.environ.get("OPENAI_KEY")

app = Flask(__name__)

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)


@app.route('/create-recipe', methods=['GET', 'OPTIONS'])
def create_recipe(request):
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
    recipe_description = request_parsed['data']['recipe_description']

    recipe_response = chat_completion_request(recipe_description)

    response = json.dumps({'data': recipe_response})
    headers = {'Access-Control-Allow-Origin': '*'}
    return (response, 200, headers)


@retry(wait=wait_random_exponential(multiplier=1, max=40), stop=stop_after_attempt(3))
def chat_completion_request(recipe_description, model="gpt-3.5-turbo-0613"):
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + openai.api_key,
    }
    json_data = {
        "model": model,
        "temperature": 1.5,
        "messages": [
            {"role": "system", "content": "You are an excellent chef who can create interesting recipes." },
            {"role": "user", "content": recipe_description }
        ],
    }
    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=json_data,
        )
        response = response.json()['choices'][0]['message']['content']
        return response
    except Exception as e:
        return e
