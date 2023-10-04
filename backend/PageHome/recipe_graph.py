from collections import defaultdict
from typing import Dict, List


def what_goes_with(
    ingredients: List[str],
    recipe_graph,
    n:int = 15
) -> List[str]:
    """
    Returns the ingredients that are most often included in the given ingredients' recipes.

    Parameters:
        ingredients: Ingredients for which to find co-ingredients.
        recipe_graph: Graph representing the recipes and their relationships.
        n (optional): Number of top co-ingredients to return. Defaults to 15.

    Returns:
        The top co-ingredients.
    """
    co_ingredient_counts = get_co_ingredients_counts(ingredients, recipe_graph)
    co_ingredients_weights = get_top_co_ingredients(co_ingredient_counts, n)

    # Get the top n co-ingredients
    top_co_ingredients = co_ingredients_weights[:n]

    return top_co_ingredients


def get_co_ingredients_counts(ingredients: str, recipe_graph) -> Dict[str, Dict[str, int]]:
    """
    Get the count of co-ingredients that appear in the recipe graph, given a list of ingredients.

    Args:
        ingredients: A string representing a comma-separated list of ingredients.
        recipe_graph: The graph representing the recipes and their ingredients.

    Returns:
        A dictionary containing the count of co-ingredients for each ingredient.
    """

    # Create a defaultdict to store the count of co-ingredients for each ingredient
    co_ingredient_counts = defaultdict(lambda: defaultdict(int))

    # Convert the input ingredients string to a set
    ingredient_set = set(ingredients.split(', '))

    # Iterate over the ingredients in the input set that are also present in the recipe graph
    for ingredient in ingredient_set.intersection(recipe_graph.nodes()):

        # Iterate over the recipes that contain the current ingredient
        for recipe in recipe_graph.neighbors(ingredient):

            # Iterate over the co-ingredients of the current recipe
            for co_ingredient in recipe_graph.neighbors(recipe):

                # If the co-ingredient is not in the input ingredient set, increment its count for the current ingredient
                if co_ingredient not in ingredient_set:
                    co_ingredient_counts[ingredient][co_ingredient] += 1

    # Convert the defaultdict to a regular dictionary and return the result
    return dict(co_ingredient_counts)

def get_top_co_ingredients(ingredient_counts: Dict[str, Dict[str, int]], n: int) -> List[str]:
    """
    Get the top co-ingredients based on the ingredient counts.

    Args:
        ingredient_counts: A dictionary containing ingredient counts.
        n (int): The number of top co-ingredients to return.
    Returns:
        List[str]: The top co-ingredients.
    """

    # Calculate the weights of co-ingredients
    co_ingredients_weights = defaultdict(int)

    for counts in ingredient_counts.values():
        for co_ingredient, count in counts.items():
            co_ingredients_weights[co_ingredient] += count

    # Sort the co-ingredients based on their weights in descending order
    co_ingredients_weights = sorted(co_ingredients_weights.items(), key=lambda item: item[1], reverse=True)

    # Get the top n co-ingredients
    top_co_ingredients = [item[0] for item in co_ingredients_weights][:n]

    return top_co_ingredients
