import re
from typing import List, Dict, Tuple

import numpy as np
from jellyfish import jaro_similarity


def get_matching_recipes(
    text: str,
    recipes: List[Dict[str, any]],
    user_cookbooks: List[str],
) -> List[Dict[str, any]]:
    """
    Filter and rank recipes based on text and user cookbooks.
    
    Args:
        text: Words to search for in recipe titles, ingredients, categories, books, and authors.
        recipes: List of recipes.
        user_cookbooks: User cookbooks to filter recipes by.
    
    Returns:
        List of recipe dictionaries, sorted by relevance.
    """

    recipes_found_indices = {}
    
    # Filter recipes by user cookbooks
    if user_cookbooks:
        recipes = [r for r in recipes if any([r['book'] in c for c in user_cookbooks])]

    # Extract words enclosed in double quotes
    must_match_words = []
    if '"' in text:
        must_match_words = re.search(r'"(.*?)"', text).group(1)
        must_match_words = must_match_words.split()
        must_match_words = set([w.replace('"', '') for w in must_match_words])

    # Remove double quotes and split text into individual words
    text = text.replace('"', '').split()

    for index, recipe in enumerate(recipes):

        recipe_points, words_matching = score_recipe(text, recipe, must_match_words)

        # Add recipe index and total points to dictionary
        if len(text) == 1 and words_matching == 1:
            recipes_found_indices[index] = recipe_points
        elif words_matching >= max(2, len(text) - 1):
            recipes_found_indices[index] = recipe_points

    # Sort recipes by relevance and select top 50
    recipes_found_indices = sorted(recipes_found_indices, key=recipes_found_indices.get, reverse=True)
    recipes_best_match = np.array(recipes)[recipes_found_indices][:50]

    # Return selected recipes without 'ingredients_standardised' and 'categories' keys
    return [
        {k:v for k, v in recipe.items() if k not in ['ingredients_standardised', 'categories']}
        for recipe in recipes_best_match
    ]


def score_recipe(
    search_text: List[str],
    recipe: Dict[str, any],
    must_match_words: List[str]
) -> Tuple[int, int]:
    """
    Score a recipe based on matching words in the search text.

    Args:
        search_text: The text to search for matching words.
        recipe: The recipe to score.
        must_match_words: Words that must be included in a recipe.

    Returns:
        The score of the recipe, and the number of matching words.
    """

    recipe_points = 0
    words_matched = 0

    for word in search_text:
        points_word = 0

        # Check if word matches recipe title
        if matching_title(word, recipe['title']):
            points_word += 1.5

        # Check if word matches any ingredient
        for ingredient in recipe['ingredients_standardised']:
            if matching_words(word, ingredient):
                points_word += 1
                break

        if points_word == 0:
            # Check if word matches any category
            for category in recipe['categories']:
                if matching_words(word, category):
                    points_word += 1
                    break

            if points_word == 0:
                # Check if word matches recipe book
                if matching_book_or_author(word, recipe['book']):
                    points_word += 1

                # Check if word matches recipe author
                elif matching_book_or_author(word, recipe['author']):
                    points_word += 1

        # Increase count of matching words if any points are scored
        if points_word > 0:
            words_matched += 1

        # Penalize word and recipe if a required word does not match anything
        elif word in must_match_words:
            words_matched = -10000
            recipe_points = -10000

        recipe_points += points_word

    return recipe_points, words_matched


def matching_words(a: str, b: str, threshold: int = 0.9) -> bool:
    """
    Check if two words match based on Jaro similarity.

    Args:
        a: The first word.
        b: The second word.
        threshold (optional): The threshold for considering a match. Defaults to 0.9.

    Returns:
        bool: True if the words match based on Jaro similarity, False otherwise.
    """

    if jaro_similarity(a, b) > threshold:
        return True
    
    
def matching_title(search_word: str, title: str) -> bool:
    """
    Check if the search word matches any word in the title.

    Args:
        search_word: The word to check for a match.
        title: The title to check for matching words.

    Returns:
        bool: True if a match is found, False otherwise.
    """

    title = title.lower().split()
    for title_word in title:
        if jaro_similarity(search_word, title_word) > 0.9:
            return True
    
    return False


def matching_book_or_author(search_word: str, b_or_a: str, threshold: float = 0.9)-> bool:
    """
    Checks if the search word matches any part of the book or author name.

    Parameters:
        search_text: The text to search for.
        b_or_a: The book or author name to compare against.
        threshold (optional): The similarity threshold. Defaults to 0.9.

    Returns:
        bool: True if there is a match, False otherwise.
    """

    b_or_a = b_or_a.lower().split()

    for word in b_or_a:
        if jaro_similarity(search_word, word) > threshold:
            return True
    
    return False
