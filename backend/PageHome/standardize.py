import re

import inflect


p = inflect.engine()

INGREDIENT_MAPPING = {
    'active dry yeast': 'yeast',
    'baby basil': 'basil',
    'cashew nut': 'cashew',
    'capsicum': 'bell pepper',
    'cherry tomatoes': 'tomato',
    'coriander leaves': 'coriander',
    'coriander stalks': 'coriander',
    'feta cheese': 'feta',
    'ginger root': 'ginger',
    'grated ginger': 'giner',
    'haloumi cheese': 'haloumi',
    'hot chilli sauce': 'chilli sauce',
    'lebanese cucumbers': 'cucumbers',
    'natural yoghurt': 'yoghurt',
    'vine tomatoes': 'tomatoes',
    'wholegrain mustard': 'mustard',
}

SYNONYMS = {
    "arugula": "rocket",
    "aubergine": "eggplant",
    "baked potato": "jacket potato",
    "bell pepper": "capsicum",
    "biscuit": "cookie",
    "celery root": "celeriac",  
    "cilantro": "coriander",
    "courgette": "zucchini",
    "filbert": "hazelnut",
    "garbanzo bean": "chickpea",
    "green onion": "scallion",
    "oatmeal": "porridge",
    "prawn": "shrimp",
    "sweet potato": "yam",
}


def standardize_ingredient(ingredient):
    
    ingredient = ingredient.strip()

    if ingredient != "sweet potato":
        ingredient = re.sub(r'(canned )|(ground )|(fresh )|(frozen )|(sweet )|( in oil)', '', ingredient)
    ingredient = re.sub(r"([a-z]+) noodle[s]*", 'noodles', ingredient)
    ingredient = re.sub(r"(light|dark) soy sauce", 'soy sauce', ingredient)
    ingredient = re.sub(r'( of your choice)', '', ingredient)
    ingredient = re.sub(r'è', 'e', ingredient)
    
    ingredient_singular = p.singular_noun(ingredient)
    if ingredient_singular:
        ingredient = ingredient_singular

    ingredient = INGREDIENT_MAPPING.get(ingredient, ingredient)
        
    ingredient = re.sub(r"([a-z]+) bell pepper", 'bell pepper', ingredient)
    ingredient = ingredient.replace("raman", "ramen")
    
    return ingredient


def replace_with_synonyms(input_str: str) -> str:
    """
    Replaces words in a string with their synonyms.

    Args:
        input_str: The input string.

    Returns:
        The input string with words replaced by their synonyms.
    """
    # Create a regular expression pattern to match the words to be replaced
    pattern = re.compile(r'\b(' + '|'.join(map(re.escape, SYNONYMS.keys())) + r')\b')
    
    # Use the pattern to replace the words with their synonyms
    return pattern.sub(lambda x: SYNONYMS[x.group()], input_str)
