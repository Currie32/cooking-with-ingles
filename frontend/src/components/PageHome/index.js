import { getFunctions, httpsCallable } from 'firebase/functions';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';


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
const StyledTooltipExample = styled.div`
  font-size: 14px;
  padding: 0px 0px 5px;
`;
const StyledCheckbox = styled.div`
    display: flex;
    margin: 5px 0px 00px -10px;
`;
const StyledCheckboxText = styled.div`
    margin: auto 0px;
    color: rgb(70, 70, 70);
    font-size: 16px;
`;
const StyledRequest = styled.p`
  margin: 0px 0px 25px;
  width: fit-content;
  font-style: italic;
  font-size: 15px;
`;
const StyledRecipeSection = styled.div`
    overflow-x: hidden;
    overflow-y: scroll;
    height: 470px;
    @media (max-width: 1199px) {height: 470px};
    @media (max-width: 959px) {height: 375px};
    @media (max-width: 599px) {height: 350px}
    background: /* Shadow covers */
    linear-gradient(#fafafa 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), #fafafa 70%) 0 100%, /* Shadows */
    radial-gradient(50% 0, farthest-side, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(50% 100%, farthest-side, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)) 0 100%;
    background: /* Shadow covers */
    linear-gradient(#fafafa 30%, rgba(255, 255, 255, 0)), linear-gradient(rgba(255, 255, 255, 0), #fafafa 70%) 0 100%, /* Shadows */
    radial-gradient(farthest-side at 50% 0, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)), radial-gradient(farthest-side at 50% 100%, rgba(0, 0, 0, .2), rgba(0, 0, 0, 0)) 0 100%;
    background-repeat: no-repeat;
    background-color: rgba(193, 195, 243, 0.01);
    background-size: 100% 40px, 100% 40px, 100% 14px, 100% 14px;
    /* Opera doesn't support this in the shorthand */
    background-attachment: local, local, scroll, scroll;
`;
const StyledCoIngredients = styled.div`
    margin: 0px auto 35px;
    font-size: 16px;
    font-style: italic;
    color: rgb(70, 70, 70);
`;
const StyledCoIngredientsHeader = styled.div`
    font-size: 17px;
    font-style: normal;
    display: flex;
    margin-bottom: 12px;
    color: rgb(0, 0, 0);
`;
const StyledCoIngredientsSearchText = styled.div`
    color: rgb(58, 60, 123);
    font-weight: 600;
    margin: -1px 0px 0px 10px;
    font-size: 17px;
`;
const StyledRecipe = styled.div`
  margin: 0px auto 35px;
`;
const StyledRecipeName = styled.div`
  font-size: 18px;
  @media (max-width: 499px) {
    font-size: 17px;
    font-weight: 600;
  };
`;
const StyledBookAndPage = styled.div`
    display: flex;
    margin: 7px 0px 3px;
`;
const StyledBook = styled.div`
    display: flex;
    font-weight: 600;
    margin-right: 20px;
    color: rgb(59, 61, 123);
    &:hover {
      text-decoration: underline;
      cursor: pointer;
  }
`;
const StyledPageNumber = styled.div`
`;
const StyledIngredientsAndCategories = styled.div`
    display: flex;
    margin: 10px 0px 5px;
    color: rgb(70, 70, 70);
`;
const StyledIngredientsAndCategoriesTitle = styled.div`
    font-weight: 500;
    margin-right: 20px;
    color: rgb(0, 0, 0);
`;
const StyledNoRecipes = styled.div`
    margin-top: 60px;
    text-align: center;
    font-style: italic;
    font-size: 17px;
`;


export default function PageHome({uid, userCookbooks, getCookbookFromSearch}) {

  const functions = getFunctions();

  const [checked, setChecked] = useState(false);
  const getChecked = (event) => {
    setChecked(event.target.checked);
    setResponseSearch({recipes: [], query: ''})
    setRecipes(false)
    setCoIngredients(false)
    setLoadingSearch(true)
    window.localStorage.setItem('searchCheckedHome', JSON.stringify(event.target.value))
  };

  const [loadingSearch, setLoadingSearch] = useState(false)
  const [recipes, setRecipes] = useState(false)
  const [coIngredients, setCoIngredients] = useState(false)
  const [searchText, setSearchText] = useState('')
  const getSearchText = (e) => {
    setRecipes(false)
    setCoIngredients(false)
    if (!e) {setSearchText(''); setLoadingSearch(false)}
    else if (e.target.value === '') {
      setSearchText('');
      setLoadingSearch(false)
      window.localStorage.setItem('searchTextHome', JSON.stringify(e.target.value))
      window.localStorage.setItem('recipesHome', JSON.stringify(false))
    }
    else {
        setLoadingSearch(true);
        setSearchText(e.target.value);
        window.localStorage.setItem('searchTextHome', JSON.stringify(e.target.value))
    }
  }
  const [searchTextDelayed, setSearchTextDelayed] = useState('')
  useEffect(() => {
    setTimeout(() => {setSearchTextDelayed(searchText)}, 500)
  }, [searchText])

  const [responseSearch, setResponseSearch] = useState({recipes: [], query: ''})
  useEffect(() => {
    if (searchText === searchTextDelayed && searchText !== '') {
      async function getData() {
        const getRecipes = httpsCallable(functions, 'get_recipes');
        if (checked) {
            const response = await getRecipes(
                {ingredients: searchText, userCookbooks: userCookbooks}
            ).then(response => response.data)
            setResponseSearch(response)
        }
        else {
            const response = await getRecipes(
                {ingredients: searchText, userCookbooks: []}
            ).then(response => response.data)
            setResponseSearch(response)
        }
      }
      getData()
    }
  }, [searchTextDelayed, checked])

  useEffect(() => {
    if (searchText && searchText?.toLowerCase() === responseSearch?.query?.toLowerCase()) {
      setRecipes(responseSearch.recipes)
      setCoIngredients(responseSearch.co_ingredients)
      setLoadingSearch(false)
      window.localStorage.setItem('recipesHome', JSON.stringify(responseSearch.recipes))
      window.localStorage.setItem('coIngredientsHome', JSON.stringify(responseSearch.co_ingredients))
    }
  }, [responseSearch?.query])

  useEffect(() => {
    if (uid === "default") {setChecked(false)}
  }, [uid])

  useEffect(() => {
    const storedSearchText = window.localStorage.getItem('searchTextHome');
    const storedRecipes = window.localStorage.getItem('recipesHome');
    const storedCoIngredients = window.localStorage.getItem('coIngredientsHome');
    const storedChecked = window.localStorage.getItem('searchCheckedHome');
    if ( storedSearchText !== null ) setSearchText(JSON.parse(storedSearchText));
    if ( storedRecipes !== null ) setRecipes(JSON.parse(storedRecipes));
    if ( storedCoIngredients !== null ) setCoIngredients(JSON.parse(storedCoIngredients));
    if ( storedChecked !== null ) setChecked(JSON.parse(storedChecked));
  }, []);

  return (
    <Content>
      <Tooltip title={
        <Fragment>
          <Typography>Example searches:</Typography>
          <StyledTooltipExample>• Vegetarian pasta</StyledTooltipExample>
          <StyledTooltipExample>• Chocolate dessert</StyledTooltipExample>
          <StyledTooltipExample>• "Tomato breakfast"</StyledTooltipExample>
          <StyledTooltipExample>• "Vietnamese" salad</StyledTooltipExample>
          <StyledTooltipExample>• Easy lunch</StyledTooltipExample>
        </Fragment>
      }>
        <InfoOutlinedIcon style={{margin: '30px 0px 2px', float: 'right', fontSize: '16px'}}/>
      </Tooltip>
      <CssTextField
          fullWidth
          variant="outlined"
          size='small'
          placeholder={'Search for recipes in cookbooks (e.g. pasta, tomatoes, cheese, etc.)'}
          onInput={getSearchText}
          value={searchText}
      />
      <StyledCheckbox>
          {uid !== "default" && <Checkbox
              checked={checked} onChange={getChecked} inputProps={{ 'aria-label': 'controlled' }} 
              sx={{color: "rgb(59, 61, 123)", '&.Mui-checked': {color: "rgb(59, 61, 123)"}}}
          />}
          {uid === "default" && 
              <Tooltip title={ <div style={{fontSize: '14px', backgroundColor: 'black', padding: '5px 10px', margin: '-3px -8px', borderRadius: '5px'}}>Sign in to search with your cookbooks</div>}>
                  <Checkbox checked={false} />
              </Tooltip>
          }
          <StyledCheckboxText>Search with only your cookbooks</StyledCheckboxText>
      </StyledCheckbox>

      <StyledRequest>
        Want to search another cookbook? Request it by <a target="_blank" rel="noreferrer" href="https://docs.google.com/forms/d/e/1FAIpQLSfPveAlQDH0RIx0qWWmibA2nKxq7Rl7wIFn6j_Mysba1iZJlQ/viewform">clicking here.</a>
      </StyledRequest>

      {loadingSearch && <Grid item xs={12} style={{justifyContent: 'center', display: 'flex', marginTop: '100px'}}>
          <CircularProgress/>
      </Grid>}

      {coIngredients?.length > 0 && <StyledCoIngredients>
          <StyledCoIngredientsHeader>
              These ingredients are commonly used with: <StyledCoIngredientsSearchText>{searchText}</StyledCoIngredientsSearchText>
          </StyledCoIngredientsHeader>
          {coIngredients.join(', ')}
      </StyledCoIngredients>}

      {recipes?.length > 0 && <StyledRecipeSection>
          
          {recipes?.map((recipe, index) => (
              <StyledRecipe key={index}>
                  <StyledRecipeName>{recipe.title}</StyledRecipeName>
                      <StyledBookAndPage>
                          <Link to="/cookbooks">
                          <StyledBook onClick={(e) => getCookbookFromSearch(e.target.textContent)}>{recipe.book} by {recipe.author}</StyledBook>
                          </Link>
                          
                          <StyledPageNumber>Page: {recipe.page}</StyledPageNumber>
                      </StyledBookAndPage>
                      <StyledIngredientsAndCategories>
                          <StyledIngredientsAndCategoriesTitle>Ingredients:</StyledIngredientsAndCategoriesTitle>
                          {recipe.ingredients.join(', ')}
                      </StyledIngredientsAndCategories>
              </StyledRecipe>
          ))}
      </StyledRecipeSection>}
      {recipes?.length === 0 && <StyledNoRecipes>
          No recipes were found with these ingredients.
      </StyledNoRecipes>}
    </Content>
  );
}
