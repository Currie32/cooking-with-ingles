import json
import logging
import pickle

from firebase_admin import credentials, firestore, initialize_app

# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

logger = logging.getLogger()
logging.basicConfig(level=logging.INFO)


def get_recipes_v2(request):
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
    search_terms = request_parsed['data']["searchTerms"]
    user_cookbooks = request_parsed['data']['userCookbooks']

    with open('recipes.pickle', 'rb') as f:
        recipes_all = pickle.load(f)

    with open('recipe_index.json', 'r') as json_file:
        recipe_index = json.load(json_file)

    indices_recipes = set(range(len(recipes_all)))

    if "ingredients" in search_terms:
        for ingredient in search_terms["ingredients"]:
            indices_ingredient = recipe_index.get(ingredient)
            if indices_ingredient:
                indices_recipes = indices_recipes & set(indices_ingredient)

    recipes = [recipes_all[index] for index in indices_recipes]

    if "authors" in search_terms:
        recipes = [r for r in recipes if r["author"] in search_terms["authors"]]

    if "cookbooks" in search_terms:
        recipes = [r for r in recipes if r["book"] in search_terms["cookbooks"]]

    if user_cookbooks:
        recipes = [r for r in recipes if r["book"] in user_cookbooks]

    recipes = sorted(recipes, key=lambda x: len(x["ingredients"]))

    response = {'recipes': recipes}

    # Need the key "data" in the return object
    response = json.dumps({'data': response})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)
