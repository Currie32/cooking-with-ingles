export function parseRecipe(recipe) {
  // Split the string into the key sections

  const sections = recipe.split(/(?:Title:|Cooking Time:|Servings:|Ingredients:|Instructions:)\s*/).slice(1);

  // Extract and clean the non-list features
  const [title, cooking_time, servings] = sections.slice(0, 3).map((section) => section.trim());

  // Extract and clean the ingredients
  const ingredients_raw = sections[3];
  const ingredients = ingredients_raw
    .split('\n')
    .map((line) => line.trim().replace(/^-\s*/, ''))
    .filter((line) => line !== '');

  // Extract and clean the instructions
  const instructions_raw = sections[4];
  const instructions = instructions_raw
    .split('\n')
    // Remove numbers from the start of the line and extract white spaces
    .map((line) => line.replace(/^\d+\.\s*/, '').trim())
    .filter((line) => line !== '');

  return {
    title,
    cooking_time,
    servings: servings,
    ingredients,
    instructions,
  };
}


export function parseVariations(text) {
  // Split the text by '\n' to get individual variation lines
  const variationLines = text.split('\n');

  // Use regular expressions to extract the variation type and description
  const variationRegex = /^(?:(?:\d+\.\s*)?([\w\s.-]+):\s*)(.*(?:\S.*\S)?)\s*$/;
  
  // Initialize an array to store the parsed variations
  const parsedVariations = [];

  // Loop through each variation line and extract the type and description
  for (const line of variationLines) {
    const match = line.match(variationRegex);
    if (match) {
      const type = match[1].trim();
      const description = match[2].trim();

      // Push the type and description as a list to the parsedVariations array
      parsedVariations.push([type, description]);
    }
  }
  return parsedVariations;
}
