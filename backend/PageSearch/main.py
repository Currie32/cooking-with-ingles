import json
import logging
import re

import inflect
from firebase_admin import credentials, firestore, initialize_app
from jellyfish import jaro_similarity
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

    ingredients = re.sub(' +', ' ', ', '.join(ingredients_raw.split(',')))

    if ingredients:

        with open('./cookbooks.json', 'rb') as fh:
            cookbooks = json.load(fh)

        for recipe in cookbooks:
            recipe_ingredients = recipe['ingredients']
            recipe_ingredients_standardised = [standardise_ingredient(i) for i in recipe_ingredients]
            recipe['ingredients_standardised'] = recipe_ingredients_standardised

        recipes = _get_recipes_by_keywords(ingredients, cookbooks)

    response = {
        'recipes': recipes,
        'query': ingredients_raw
    }

    # Need the key "data" in the return object
    response = json.dumps({'data': response})

    headers = {'Access-Control-Allow-Origin': '*'}

    return (response, 200, headers)


def _get_recipes_by_keywords(text, recipes):
    
    text = text.split(',')
    
    recipes_found = {}
    
    for index, recipe in enumerate(recipes):
        
        points = 0
        
        for word in text:
            if word in recipe['title'].lower():
                points += 1
                
            elif any([matching_ingredients(word, c) for c in recipe['categories']]):
                points += 1
                
            elif any([matching_ingredients(word, c) for c in recipe['ingredients_standardised']]):
                points += 1

        if points >= max(1, len(text) - 1):
            recipes_found[index] = points
            
    recipes_found = dict(sorted(recipes_found.items(), key=lambda item: item[1], reverse=True))
                
    return list(np.array(recipes)[list(recipes_found)])


def matching_ingredients(ingredient_input, ingredient_recipe):

    ingredient_input = ingredient_input.lower()
    ingredient_recipe = ingredient_recipe.lower()
    
    if jaro_similarity(ingredient_input, ingredient_recipe) > 0.9:
        return True


def standardise_ingredient(ingredient):
    
    ingredient = ingredient.lower()
    
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

