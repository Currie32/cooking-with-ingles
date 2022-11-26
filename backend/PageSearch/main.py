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
    ingredients_raw = request_parsed['data']['ingredients']
    user_cookbooks = request_parsed['data']['userCookbooks']

    if ingredients_raw:

        ingredients = [standardise_ingredient(i) for i in ingredients_raw.split(',')]

        with open('./cookbooks.json', 'rb') as fh:
            cookbooks = json.load(fh)

        recipes = _get_recipes_by_keywords(ingredients, cookbooks, user_cookbooks)
        recipe_graph = nx.read_gpickle('./recipe_graph.pkl')
        co_ingredients = what_goes_with(ingredients, recipe_graph)

    response = {
        'recipes': recipes,
        'co_ingredients': co_ingredients,
        'query': ingredients_raw
    }

    # Need the key "data" in the return object
    response = json.dumps({'data': response})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)


def _get_recipes_by_keywords(text, recipes, user_cookbooks):
        
    recipes_found_indices = {}
    
    if user_cookbooks:
        recipes = [r for r in recipes if any([r['book'] in c for c in user_cookbooks])]
    
    for index, recipe in enumerate(recipes):
        
        points = 0
                
        for word in text:
                
            if word in recipe['title'].lower():
                points += 1
            
            if any([matching_ingredients(word, t) for t in recipe['title'].split()]):
                points += 1
                
            if any([matching_ingredients(word, c) for c in recipe['categories']]):
                points += 1
                
            if any([matching_ingredients(word, i) for i in recipe['ingredients_standardised']]):
                points += 1

            if matching_ingredients(word, recipe['book']):
                points += 1
                
            if matching_ingredients(word, recipe['author'], 0.8):
                points += 1

        if points >= max(1, len(text) - 1):
            recipes_found_indices[index] = points
            
    recipes_found_indices = dict(sorted(recipes_found_indices.items(), key=lambda item: item[1], reverse=True))
    recipes_best_match = np.array(recipes)[list(recipes_found_indices)][:50]
    
    return [
        {k:v for k, v in recipe.items() if k not in ['ingredients_standardised', 'categories']}
        for recipe in recipes_best_match
    ]


def matching_ingredients(ingredient_input, ingredient_recipe, threshold=0.9):

    ingredient_input = ingredient_input.lower()
    ingredient_recipe = ingredient_recipe.lower()
    
    if jaro_similarity(ingredient_input, ingredient_recipe) > threshold:
        return True


def standardise_ingredient(ingredient):
    
    ingredient = ingredient.lower().strip()

    ingredient = ingredient_mapping.get(ingredient, ingredient)
    
    ingredient = re.sub(r'(canned )|(ground )|(sweet )', '', ingredient)
    ingredient = re.sub(r"([a-z]+) mushroom[s]*", 'mushroom', ingredient)
    ingredient = re.sub(r"([a-z]+) noodle[s]*", 'noodles', ingredient)
    ingredient = re.sub(r'( of your choice)', '', ingredient)
    ingredient = re.sub(r'è', 'e', ingredient)
    
    ingredient_singular = p.singular_noun(ingredient)
    if ingredient_singular:
        ingredient = ingredient_singular
        
    ingredient = re.sub(r"([a-z]+) bell pepper", 'bell pepper', ingredient)
    
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
