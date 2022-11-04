import json
import re

from flask import Flask, request, render_template
import inflect
from jellyfish import jaro_similarity
import networkx as nx
import numpy as np


app = Flask(__name__)
p = inflect.engine()

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

BLACKLIST_INGREDIENTS = [
    'limes', 'lemons', 'coriander leaves', 'garlic', 'turmeric',
    'coconut oil', 'fresh ginger', 'parsley', 'vegetable stock',
    'ginger root', 'cumin seeds', 'soy sauce', 'clear honey',
    'maple syrup', 'mint', 'ground cumin', 'thyme'
]

@app.route("/recipes")
def index():
    
    with open('../backend/cookbooks.json', 'rb') as fh:
        cookbooks = json.load(fh)

    return json.dumps(cookbooks[:5])

    for recipe in cookbooks:
        ingredients = recipe['ingredients']
        ingredients_standardised = [standardise_ingredient(i) for i in ingredients]
        recipe['ingredients_standardised'] = ingredients_standardised

    graph_recipe = build_recipe_graph(cookbooks)

    ingredients = request.args.get("ingredients", "")
    ingredients = re.sub(' +', ' ', ', '.join(ingredients.split(',')))
    
    if ingredients:
        recipes = _get_recipes_by_keywords(ingredients, cookbooks)
        that_goes_with = what_goes_with(ingredients, graph_recipe, cookbooks)
        
        print_output = ""
        for c in recipes:
            print_output += f"""<h3 style="margin-bottom: -10px">{c['title']}</h3>\
            \n{c['book']}, Page: {c['page']}\
            \nIngredients: {', '.join(c['ingredients'])}\
            \nCategories: {', '.join(c['categories'])}\
            \n\n"""

        return render_template("index.html", ingredients=ingredients, recipes=recipes, that_goes_with=that_goes_with)

    else:
        return render_template("index.html")


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


def build_recipe_graph(recipes):

    recipe_graph = nx.Graph(label="recipes")

    for index, recipe in enumerate(recipes):
        recipe_graph.add_node(
            recipe['title'],
            key=index,
            label="recipe",
        )        
            
        for ingredient in recipe['ingredients_standardised']:

            if ingredient not in BLACKLIST_INGREDIENTS:
                recipe_graph.add_node(ingredient, label="ingredient")
                recipe_graph.add_edge(recipe['title'], ingredient, label="ingredient_of")

    return recipe_graph


def what_goes_with(ingredients, recipe_graph, recipes, n=15):
    
    co_recipe_counts = {}
    co_ingredients_all = []

    for ingredient in ingredients.split(', '):
        
        co_recipe_counts[ingredient] = {}

        for recipe in recipe_graph.neighbors(ingredient):
            for co_ingredient in recipe_graph.neighbors(recipe):

                if co_ingredient in ingredients:
                    continue

                if co_ingredient not in co_recipe_counts[ingredient]:
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



if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)
