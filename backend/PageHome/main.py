import json
import logging
import os
import pickle

from firebase_admin import credentials, firestore, initialize_app
from openai import OpenAI

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
    user_recipe_lists_ids = request_parsed['data']['userRecipeListsIds']

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

    if user_recipe_lists_ids:
        recipes_from_lists = [
            index for index, recipe in enumerate(recipes_all)
            if recipe['id'] in user_recipe_lists_ids
        ]
        indices_recipes = indices_recipes & set(recipes_from_lists)

    if user_cookbooks:
        indices_user_cookbooks = []
        for cookbook in user_cookbooks:
            indices_user_cookbooks.extend(recipe_index.get(cookbook, []))
        indices_recipes = indices_recipes & set(indices_user_cookbooks)

    recipes = [recipes_all[index] for index in indices_recipes]

    if "authors" in search_terms:
        recipes = [r for r in recipes if r["author"] in search_terms["authors"]]

    if "cookbooks" in search_terms:
        recipes = [r for r in recipes if r["book"] in search_terms["cookbooks"]]

    if "recipes" in search_terms:
        recipes = [r for r in recipes if r["title"] in search_terms["recipes"]]

    if not (len(list(search_terms.keys())) == 1 and len(search_terms.get("cookbooks", [])) == 1):
        recipes = sorted(recipes, key=lambda x: len(x["ingredients"]))

    response = {'recipes': recipes}

    # Need the key "data" in the return object
    response = json.dumps({'data': response})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)


def generate_recipe(request):
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

    title = request_parsed['data']["title"]
    ingredients = request_parsed['data']["ingredients"]

    prompt = f"Generate a recipe called '{title}' using the ingredients: {', '.join(ingredients)}."
    response_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "recipe",
            "schema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "ingredients": {
                        "type": "array",
                        "items": {
                            "type": "string",
                            "properties": {"ingredient": {"type": "string"}},
                            "required": ["ingredient"],
                            "additionalProperties": False
                        }
                    },
                    "servings": {"type": "integer"},
                    "total_time": {"type": "string"},
                    "instructions": {"type": "string"}
                },
                "required": ["title", "ingredients", "servings", "total_time", "instructions"],
                "additionalProperties": False
            },
            "strict": True
        }
    }

    api_key = os.environ.get("OPENAI_KEY")
    client = OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
                {
                    "role": "system", 
                    "content": prompt
                }
            ],
        response_format=response_format
    )
    response = json.loads(response.choices[0].message.content)
    response = json.dumps({'data': response})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)
