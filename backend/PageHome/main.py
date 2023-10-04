import json
import logging
import pickle

import inflect
import networkx as nx
from firebase_admin import credentials, firestore, initialize_app

from recipe_graph import what_goes_with
from recipe_search import get_matching_recipes
from standardize import replace_with_synonyms, standardize_ingredient


p = inflect.engine()

# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)


def get_recipes(request):
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
    search_text_raw = request_parsed['data']['ingredients']
    user_cookbooks = request_parsed['data']['userCookbooks']

    if search_text_raw:

        search_text = search_text_raw.replace(',', '').replace("'", '"').lower()
        search_text = replace_with_synonyms(search_text)
        search_text = ' '.join([standardize_ingredient(s) for s in search_text.split()])

        with open('./recipes.pkl', 'rb') as fh:
            recipes = pickle.load(fh)

        recipes_matching = get_matching_recipes(search_text, recipes, user_cookbooks)
        recipe_graph = nx.read_gpickle('./recipe_graph.pkl')
        co_ingredients = what_goes_with(search_text, recipe_graph)

    response = {
        'recipes': recipes_matching,
        'co_ingredients': co_ingredients,
        'query': search_text_raw
    }

    # Need the key "data" in the return object
    response = json.dumps({'data': response})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)
