import json
import logging
import re

import inflect
from firebase_admin import credentials, firestore, initialize_app
from jellyfish import jaro_similarity
import networkx as nx
import numpy as np

p = inflect.engine()


# Use certificate to connect to database
cred = credentials.Certificate('./serviceAccountKey.json')
initialize_app(cred)
db = firestore.client()

logger = logging.getLogger()

ingredient_mapping = {
    'baby basil': 'basil',
    'capsicum': 'bell pepper',
    'cherry tomatoes': 'tomato',
    'coriander leaves': 'coriander',
    'coriander stalks': 'coriander',
    'ginger root': 'ginger',
    'haloumi cheese': 'haloumi',
    'hot chilli sauce': 'chilli sauce',
    'Lebanese cucumbers': 'cucumbers',
    'natural yoghurt': 'yoghurt',
    'vine tomatoes': 'tomatoes',
    'wholegrain mustard': 'mustard',
}


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

        search_text = search_text_raw.replace(',', '').replace("'", '"').split()
        search_text = [standardise_ingredient(s) for s in search_text]

        with open('./cookbooks.json', 'rb') as fh:
            cookbooks = json.load(fh)

        recipes = _get_recipes_by_keywords(search_text, cookbooks, user_cookbooks)
        recipe_graph = nx.read_gpickle('./recipe_graph.pkl')
        co_ingredients = what_goes_with(search_text, recipe_graph)

    response = {
        'recipes': recipes,
        'co_ingredients': co_ingredients,
        'query': search_text_raw
    }

    # Need the key "data" in the return object
    response = json.dumps({'data': response})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)


def _get_recipes_by_keywords(text, recipes, user_cookbooks):
        
    recipes_found_indices = {}
    
    if user_cookbooks:
        recipes = [r for r in recipes if any([r['book'] in c for c in user_cookbooks])]

    must_match_words = []
    if any(['"' in word for word in text]):
        must_match_words = re.search(r'"(.*?)"', ' '.join(text)).group(1)
        must_match_words = must_match_words.split()
        must_match_words = [w.replace('"', '') for w in must_match_words]

    for index, recipe in enumerate(recipes):

        points_recipe = 0
        matching_words = 0

        for word in text:

            word = word.replace('"', '')

            points_word = 0

            if matching_title(word, recipe['title']):
                points_word += 1.5

            if any([matching_ingredients(word, i) for i in recipe['ingredients_standardised']]):
                points_word += 1

            if points_word == 0:
                if any([matching_ingredients(word, c) for c in recipe['categories']]):
                    points_word += 1

                if matching_book_or_author(word, recipe['book']):
                    points_word += 1

                if matching_book_or_author(word, recipe['author']):
                    points_word += 1

            if points_word > 0:
                matching_words += 1

            if must_match_words:
                if word in must_match_words and points_word == 0:
                    matching_words = -10000
                    points_recipe = -10000

            points_recipe += points_word

        if len(text) == 1 and matching_words == 1:
            recipes_found_indices[index] = points_recipe
        elif matching_words >= max(2, len(text) - 1):
            recipes_found_indices[index] = points_recipe

    recipes_found_indices = dict(sorted(recipes_found_indices.items(), key=lambda item: item[1], reverse=True))
    recipes_best_match = np.array(recipes)[list(recipes_found_indices)][:50]

    return [
        {k:v for k, v in recipe.items() if k not in ['ingredients_standardised', 'categories']}
        for recipe in recipes_best_match
    ]


def matching_ingredients(ingredient_input, ingredient_recipe, threshold=0.9):

    if jaro_similarity(ingredient_input, ingredient_recipe) > threshold:
        return True
    
    
def matching_title(word, title):

    if any([matching_ingredients(word, t) for t in title.lower().split()]):
        return True
    else:
        return False
    

def matching_book_or_author(search_text, b_or_a, threshold=0.9):

    search_text = search_text.lower()
    b_or_a = b_or_a.lower()

    if any([jaro_similarity(search_text, x) > threshold for x in b_or_a.split()]):
        return True


def standardise_ingredient(ingredient):

    ingredient = ingredient.lower().strip()

    ingredient = ingredient_mapping.get(ingredient, ingredient)

    ingredient = re.sub(r'(canned )|(ground )|(sweet )|( in oil)', '', ingredient)
    ingredient = re.sub(r"([a-z]+) mushroom[s]*", 'mushroom', ingredient)
    ingredient = re.sub(r"([a-z]+) noodle[s]*", 'noodles', ingredient)
    ingredient = re.sub(r'( of your choice)', '', ingredient)
    ingredient = re.sub(r'è', 'e', ingredient)

    ingredient_singular = p.singular_noun(ingredient)
    if ingredient_singular:
        ingredient = ingredient_singular

    ingredient = re.sub(r"([a-z]+) bell pepper", 'bell pepper', ingredient)
    ingredient = ingredient.replace("raman", "ramen")

    return ingredient


def what_goes_with(ingredients, recipe_graph, n=15):

    co_recipe_counts = {}
    co_ingredients_all = []

    for ingredient in ingredients:

        if recipe_graph.has_node(ingredient):

            co_recipe_counts[ingredient] = {}

            for recipe in recipe_graph.neighbors(ingredient):
                for co_ingredient in recipe_graph.neighbors(recipe):

                    if co_ingredient in ingredients:
                        continue

                    elif co_ingredient not in co_recipe_counts[ingredient]:
                        co_recipe_counts[ingredient][co_ingredient] = 1
                        co_ingredients_all.append(co_ingredient)
                    else:
                        co_recipe_counts[ingredient][co_ingredient] += 1

    co_ingredients_all = sorted(set(co_ingredients_all))

    co_ingredients_weights = {}
    for co_ingredient in co_ingredients_all:
        value = 1
        for counts in co_recipe_counts.values():
            if co_ingredient in list(counts):
                value = value * counts[co_ingredient]
        co_ingredients_weights[co_ingredient] = value

    co_ingredients_weights = dict(sorted(co_ingredients_weights.items(), key=lambda item: item[1], reverse=True))
    top_co_ingredients = list(co_ingredients_weights)[:n]

    return top_co_ingredients
