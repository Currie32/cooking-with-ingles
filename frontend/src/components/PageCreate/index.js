import { getAnalytics, logEvent } from "firebase/analytics";
import CircularProgress from '@material-ui/core/CircularProgress';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@mui/material/Button';
import { styled as styledMUI } from '@mui/material/styles';
import { useEffect, useState } from "react";
import CreatableSelect from "react-select";
import styled from 'styled-components';

import {parseRecipe, parseVariations} from './recipeParser';
import {fetchChatCompletions} from './queryOpenai'


const Content = styled.div`
  margin: auto;
  max-width: 700px;
`;
const CssTextField = withStyles({
  root: {
    backgroundColor: 'white',
    margin: '0px 0px 0px',

    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: '1px solid rgba(0, 0, 0, 0.2)',
      },
      '&:hover fieldset': {
        border: '1px solid rgba(0, 0, 0, 0.3)',
      },
      '&.Mui-focused fieldset': {
        border: '1px solid rgba(0, 0, 0, 0.5)',
      },
    },
  },
})(TextField);
const GuidanceText = styled.p`
  color: rgb(70, 70, 70);  
  font-style: italic;
  margin: 15px 0px -5px;
`;
const GuidanceTextRecipeTitles = styled.p`
  color: rgb(70, 70, 70);
  font-size: 14px;
  font-style: italic;
  margin: 0px 0px 3px;
  text-align: right;
`;
const StyleFieldTitle = styled.p`
  font-size: 14px;
  margin-bottom: 5px;
  padding-left: 1px;
`;
const StyledButtonAddRecipe = styled.div`
  margin: 25px auto 20px;
  width: 300px;
`
const ButtonCreateRecipeTitles = styledMUI(Button)({
  width: '300px',
  fontSize: '16px',
  height: '50px',
  color: 'rgba(79, 118, 226, 1)',
  borderColor: 'rgba(79, 118, 226, 0.5)',
  backgroundColor: 'rgba(79, 118, 226, 0.1)',
  '&:hover': {
    backgroundColor: 'rgba(79, 118, 226, 0.2)',
    borderColor: 'rgba(79, 118, 226, 0.6)',
  },
})
const RecipeTitle = styledMUI(Button)({
  border: '1px solid rgb(200, 200, 200)',
  borderRadius: '4px',
  color: 'rgb(50, 50, 50)',
  fontFamily: 'Lato',
  fontSize: '15px',
  justifyContent: 'left',
  marginBottom: '1px',
  padding: '10px 15px',
  textTransform: 'none',
  width: '100%',
  '&:hover': {
    backgroundColor: 'rgba(79, 118, 226, 0.05)',
    borderColor: 'rgba(79, 118, 226, 0.6)',
  },
})
const FullRecipeTitle = styled.h3`
  margin-bottom: 5px;
`;
const CookingTimeAndServings = styled.div`
  display: flex;
`;
const RecipeDetailText = styled.p`
  font-size: 14px;
  font-style: italic;
  margin: 0px 10px 0px 0px;
`;
const RecipeDetailHeader = styled.h3`
  margin: 20px 15px 10px 0px;
`;
const IngredientsSubheader = styled.h4`
  margin-bottom: 10px;
`;
const IngredientsText = styled.p`
  font-weight: 100;
  margin: 5px 0px;
`;
const InstructionsText = styled.p`
  font-weight: 100;
  line-height: 1.4;
  margin: 10px 0px;
`;
const ButtonVariations = styledMUI(Button)({
  backgroundColor: 'rgba(79, 118, 226, 0.1)',
  borderColor: 'rgba(79, 118, 226, 0.5)',
  color: 'rgba(79, 118, 226, 1)',
  fontSize: '13px',
  height: '40px',
  margin: '20px 0px 15px',
  padding: '5px',
  width: '215px',
  '&:hover': {
    backgroundColor: 'rgba(79, 118, 226, 0.2)',
    borderColor: 'rgba(79, 118, 226, 0.6)',
  },
})


export default function PageCreate() {

  const analytics = getAnalytics()

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const getTitle = (e) => {
    if (!e) {setTitle('')}
    else if (e.target.value === '') {
      setTitle('');
      window.localStorage.setItem('titleCreate', JSON.stringify(e.target.value))
    }
    else {
      setTitle(e.target.value);
      window.localStorage.setItem('titleCreate', JSON.stringify(e.target.value))
    }
  }
  const [cookingTime, setCookingTime] = useState('')
  const getCookingTime = (e) => {
    if (!e) {setCookingTime('')}
    else if (e.target.value === '') {
      setCookingTime('');
      window.localStorage.setItem('cookingTimeCreate', JSON.stringify(e.target.value))
    }
    else {
      setCookingTime(e.target.value);
      window.localStorage.setItem('cookingTimeCreate', JSON.stringify(e.target.value))
    }
  }
  const [servings, setServings] = useState('')
  const getServings = (e) => {
    if (!e) {setServings('')}
    else if (e.target.value === '') {
      setServings('');
      window.localStorage.setItem('servingsCreate', JSON.stringify(e.target.value))
    }
    else {
      setServings(e.target.value);
      window.localStorage.setItem('servingsCreate', JSON.stringify(e.target.value))
    }
  }
  const [diet, setDiet] = useState(false)
  const getDiet = (selectedDiet) => {
    if (selectedDiet) {
      setDiet(selectedDiet.value)
      window.localStorage.setItem('dietCreate', JSON.stringify(selectedDiet.value))
    } else {
      setDiet(false)
      window.localStorage.setItem('dietCreate', JSON.stringify(false))
    }
  }

  const [recipeTitles, setRecipeTitles] = useState(false)
  async function fetchRecipeTitles() {

    logEvent(analytics, 'recipe_query', {value: title})

    let message_titles = "Create 10 recipe titles for " + title
    if (cookingTime) {
      message_titles = message_titles + ". The cooking time must be under " + cookingTime + " minutes"
    }
    if (diet) {
      message_titles = message_titles + ". The recipe must be " + diet
    }
    
    const response = await fetchChatCompletions(message_titles)
    try {
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.log(error)
    }
  }
  async function getRecipeTitles() {
    setLoading(true)
    setRecipeTitles(false)
    setRecipe(false)
    setRecipeUnparsed(false)
    setRecipeVariations(false)
    const response = await fetchRecipeTitles();
    setLoading(false)
    setRecipeTitles(response.choices[0].message.content)
    window.localStorage.setItem('recipeTitles', JSON.stringify(response.choices[0].message.content))
    window.localStorage.setItem('recipe', JSON.stringify(''))
    window.localStorage.setItem('recipeUnparsed', JSON.stringify(''))
    window.localStorage.setItem('recipeVariations', JSON.stringify(''))
  }


  const [recipe, setRecipe] = useState(false)
  const [recipeUnparsed, setRecipeUnparsed] = useState(false)
  async function fetchRecipe(recipeTitle) {

    let message_recipe = "Write a recipe for " + recipeTitle + ". Structure the response as:"
    message_recipe = message_recipe + "\nTitle: " + recipeTitle
    message_recipe = message_recipe + "\nCooking Time: " + cookingTime + " minutes"
    message_recipe = message_recipe + "\nServings: " + servings
    message_recipe = message_recipe + "\nIngredients:"
    message_recipe = message_recipe + "\nInstructions:"
    message_recipe = message_recipe + "\n(Use grams instead of ounces)"
    message_recipe = message_recipe + "\n(Check that the cooking time is correct and adjust it to be accurate)"
    
    const response = await fetchChatCompletions(message_recipe)
    try {
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.log(error)
    }
  }
  async function getRecipe(recipeTitle) {
    setRecipe(false)
    setRecipeUnparsed(false)
    setRecipeVariations(false)
    setLoading(true)
    const response = await fetchRecipe(recipeTitle);
    setLoading(false)
    setRecipe(parseRecipe(response.choices[0].message.content))
    setRecipeUnparsed(response.choices[0].message.content)
    window.localStorage.setItem('recipe', JSON.stringify(parseRecipe(response.choices[0].message.content)))
    window.localStorage.setItem('recipeUnparsed', JSON.stringify(response.choices[0].message.content))
    window.localStorage.setItem('recipeVariations', JSON.stringify(''))
  }


  const [recipeVariations, setRecipeVariations] = useState(false)
  const [recipeVariationsError, setRecipeVariationsError] = useState(false)
  async function fetchRecipeVariations(recipeTitle) {
    
    let message_recipe = "What are some variations for this recipe:\n" + recipeUnparsed
    message_recipe = message_recipe + "\nUse the format:\n<type-of-variation>: <description-of-variation>s"
    message_recipe = message_recipe + "\nFor example:"
    message_recipe = message_recipe + "\nSpicy Slaw: Add a kick of heat to the slaw by stirring in some sriracha or chili garlic sauce to taste. Adjust the spiciness according to your preference."
    message_recipe = message_recipe + "\nBaja Shrimp Tacos: Swap out the white fish for peeled and deveined shrimp. Marinate the shrimp in a mixture of lime juice, garlic, chili powder, and olive oil for 15 minutes before cooking. Sauté the shrimp in a hot skillet until pink and cooked through, then assemble the tacos as usual."
    
    const response = await fetchChatCompletions(message_recipe)
    try {
      const data = await response.json();
      return data;
    }
    catch (error) {
      console.log(error)
      setRecipeVariationsError(true)
    }
  }
  async function getRecipeVariations() {
    setRecipeVariations(false)
    setRecipeVariationsError(false)
    setLoading(true)
    const response = await fetchRecipeVariations();
    setLoading(false)
    const reponseParsed = parseVariations(response.choices[0].message.content)
    setRecipeVariations(reponseParsed)
    window.localStorage.setItem('recipeVariations', JSON.stringify(reponseParsed))
  }

  useEffect(() => {
    const storedTitle = window.localStorage.getItem('titleCreate');
    const storedCookingTime = window.localStorage.getItem('cookingTimeCreate');
    const storedServings = window.localStorage.getItem('servingsCreate');
    const storedDiet = window.localStorage.getItem('dietCreate');
    const storedRecipeTitles = window.localStorage.getItem('recipeTitles');
    const storedRecipe = window.localStorage.getItem('recipe');
    const storedRecipeUnparsed = window.localStorage.getItem('recipeUnparsed');
    const storedRecipeVariations = window.localStorage.getItem('recipeVariations');
    if ( storedTitle !== null ) setTitle(JSON.parse(storedTitle));
    if ( storedCookingTime !== null ) setCookingTime(JSON.parse(storedCookingTime));
    if ( storedServings !== null ) setServings(JSON.parse(storedServings));
    if ( storedDiet !== null ) setDiet(JSON.parse(storedDiet));
    if ( storedRecipeTitles !== null ) setRecipeTitles(JSON.parse(storedRecipeTitles));
    if ( storedRecipe !== null ) setRecipe(JSON.parse(storedRecipe));
    if ( storedRecipeUnparsed !== null ) setRecipeUnparsed(JSON.parse(storedRecipeUnparsed));
    if ( storedRecipeVariations !== null ) setRecipeVariations(JSON.parse(storedRecipeVariations));
  }, []);

  return (
    <Content>
      <h2>Create recipes using AI</h2>
      <CssTextField
        fullWidth
        variant="outlined"
        size='small'
        placeholder={'Ingredients, cuisine, name of recipe'}
        onInput={getTitle}
        value={title}
      />
      <GuidanceText>Optional fields:</GuidanceText>
      <div style={{display: 'flex'}}>
        <div style={{marginRight: '15px', width: '33%'}}>
          <StyleFieldTitle>Cooking time (minutes)</StyleFieldTitle>
        </div>
        <div style={{marginRight: '15px', width: '33%'}}>
          <StyleFieldTitle>Servings</StyleFieldTitle>
        </div>
        <div style={{width: '33%'}}>
          <StyleFieldTitle>Diet</StyleFieldTitle>
        </div>
      </div>
      <div style={{display: 'flex'}}>
        <div style={{marginRight: '15px', width: '33%'}}>
          <CssTextField
              fullWidth
              variant="outlined"
              size='small'
              placeholder={'Cooking time'}
              onInput={getCookingTime}
              value={cookingTime}
            />
        </div>
        <div style={{marginRight: '15px', width: '33%'}}>
          <CssTextField
              fullWidth
              variant="outlined"
              size='small'
              placeholder={'Servings'}
              onInput={getServings}
              value={servings}
            />
        </div>
        <div style={{width: '33%'}}>
          <CreatableSelect
              components={{DropdownIndicator: null}}
              isClearable
              options={[
                {"value": "Gluten-free", "label": "Gluten-free"},
                {"value": "Pescatarian", "label": "Pescatarian"},
                {"value": "Vegan", "label": "Vegan"},
                {"value": "Vegetarian", "label": "Vegetarian"},
              ]}
              value={diet ? [diet].map(v => {return ({label: v, value: v})}) : false}
              onChange={getDiet}
              placeholder={'Diet'}
              styles={{
                control: (styles, state) => ({
                  ...styles,
                  height: "40px",
                }),
                placeholder: (defaultStyles) => {
                  return {
                    ...defaultStyles,
                    color: "rgba(0, 0, 0, 0.35)",
                    fontSize: "17px",
                  }
                }
              }}
            />
        </div>
      </div>
      <StyledButtonAddRecipe>
        <ButtonCreateRecipeTitles color="success" variant="outlined" disabled={!title} onClick={getRecipeTitles}>
          Create recipes
        </ButtonCreateRecipeTitles>
      </StyledButtonAddRecipe>

      {recipeTitles && <div>
        <GuidanceTextRecipeTitles>Click on a title to see the full recipe</GuidanceTextRecipeTitles>
        {recipeTitles.split("\n").map((title, index) => (
          <RecipeTitle key={index} onClick={(e) => getRecipe(e.target.textContent.slice(3))}>{title}</RecipeTitle>
        ))}

        {recipe && <div>
          <FullRecipeTitle>{recipe.title}</FullRecipeTitle>
          <CookingTimeAndServings>
            <RecipeDetailText>{recipe.cooking_time},</RecipeDetailText>
            <RecipeDetailText>{recipe.servings} Servings</RecipeDetailText>
          </CookingTimeAndServings>
          <RecipeDetailHeader>Ingredients:</RecipeDetailHeader>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index}>
              {ingredient.startsWith('For') ? (
                <IngredientsSubheader>{ingredient}</IngredientsSubheader>
              ) : (
                <IngredientsText>{ingredient}</IngredientsText>
              )}
            </div>
          ))}
          <RecipeDetailHeader>Instructions:</RecipeDetailHeader>
          {recipe.instructions.map((instruction, index) => (
            <InstructionsText key={index}>{instruction}</InstructionsText>
          ))}
          <ButtonVariations color="success" variant="outlined" onClick={getRecipeVariations}>
            Variations of this recipe
          </ButtonVariations>
          {recipeVariations && <div>
            {recipeVariations.map((variation, index) => (
              <InstructionsText key={index}><strong style={{fontWeight: '400'}}>{variation[0]}</strong>: {variation[1]}</InstructionsText>
            ))}
          </div>}
          {recipeVariationsError && <div>
            There was an issue with get the data from OpenAI. Wait 30 seconds then try again.
          </div>}
        </div>}
      </div>}
      
      {loading && <div style={{justifyContent: 'center', display: 'flex', margin: '100px 0px 50px'}}>
          <CircularProgress/>
      </div>}
    </Content>
  );
}
