import React from 'react';
import firebase from 'firebase';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import { styled as styledMUI } from '@mui/material/styles';

import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';


const StyledPage = styled.div`
  min-height: 580px;
  margin: 0px 20px;
`;
const StyledContent = styled.div`
    margin: 60px auto 0px;
    max-width: 700px;
`;
const CssTextField = withStyles({
  root: {
    backgroundColor: 'white',
    margin: '40px 0px',
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
const StyledRecipeSection = styled.div`
    overflow-x: hidden;
    overflow-y: scroll;
    height: 510px;
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
    margin: 10px auto 30px;
    font-size: 16px;
    font-style: italic;
    color: rgb(70, 70, 70);
`;
const StyledCoIngredientsHeader = styled.p`
    font-size: 18px;
    font-style: normal;
    display: flex;
    color: rgb(0, 0, 0);
`;
const StyledCoIngredientsSearchText = styled.div`
    color: rgb(58, 60, 123);
    font-weight: 600;
    margin: -1px 0px 0px 10px;
    font-size: 18px;
`;
const StyledRecipe = styled.div`
  margin: 0px auto 35px;
`;
const StyledRecipeName = styled.div`
  font-size: 18px;
  @media (max-width: 499px) {font-size: 15px};
`;
const StyledBookAndPage = styled.div`
    display: flex;
    margin: 7px 0px 3px;
`;
const StyledBook = styled.div`
    font-weight: 600;
    margin-right: 20px;
    color: rgb(59, 61, 123);
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


export default function PageSearch() {

  const [loadingSearch, setLoadingSearch] = React.useState(false)
  const [recipes, setRecipes] = React.useState(false)
  const [coIngredients, setCoIngredients] = React.useState(false)
  const [searchText, setSearchText] = React.useState('')
  const getSearchText = (e) => {
    setRecipes(false)
    setCoIngredients(false)
    if (!e) {setSearchText(''); setLoadingSearch(false)}
    else if (e.target.value === '') {setSearchText(''); setLoadingSearch(false)}
    else {setLoadingSearch(true); setSearchText(e.target.value)}
  }
  const [searchTextDelayed, setSearchTextDelayed] = React.useState('')
  React.useEffect(() => {
    setTimeout(() => {setSearchTextDelayed(searchText)}, 500)
  }, [searchText])

  const [responseSearch, setResponseSearch] = React.useState({recipes: [], query: ''})
  React.useEffect(() => {
    if (searchText === searchTextDelayed && searchText !== '') {
        console.log('123')
      async function getData() {
        // firebase.analytics().logEvent("searching")
        const getRecipes = firebase.functions().httpsCallable('get_recipes');
        const response = await getRecipes({
          ingredients: searchText
        }).then(response => response.data)
        console.log(response)
        setResponseSearch(response)
      }
      getData()
    }
  }, [searchTextDelayed])

  React.useEffect(() => {
    if (searchText && searchText?.toLowerCase() === responseSearch?.query?.toLowerCase()) {
      setRecipes(responseSearch.recipes)
      setCoIngredients(responseSearch.co_ingredients)
      setLoadingSearch(false)
    }
  }, [responseSearch?.query])

  console.log(searchText, searchTextDelayed)

  return (
    <StyledPage>
        <Grid container spacing={3}>

          <Grid item xs={12}>
            <StyledContent>
                <CssTextField
                fullWidth variant="outlined" size='small' placeholder={'Search for recipes (e.g. pasta, tomatoes, cheese, etc.)'} onInput={getSearchText} value={searchText}
                />

                {loadingSearch && <Grid item xs={12} style={{justifyContent: 'center', display: 'flex', marginTop: '100px'}}>
                    <CircularProgress/>
                </Grid>}

                {coIngredients && <StyledCoIngredients>
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
                                    <StyledBook>{recipe.book}</StyledBook>
                                    <StyledPageNumber>Page: {recipe.page}</StyledPageNumber>
                                </StyledBookAndPage>
                                <StyledIngredientsAndCategories>
                                    <StyledIngredientsAndCategoriesTitle>Ingredients:</StyledIngredientsAndCategoriesTitle>
                                    {recipe.ingredients.join(', ')}
                                </StyledIngredientsAndCategories>
                                <StyledIngredientsAndCategories>
                                    <StyledIngredientsAndCategoriesTitle>Categories:</StyledIngredientsAndCategoriesTitle>
                                    {recipe.categories.join(', ')}
                                </StyledIngredientsAndCategories>
                        </StyledRecipe>
                        ))}
                        </StyledRecipeSection>
                }
            </StyledContent>
            
            
          </Grid>
        </Grid>
    </StyledPage>
  );
}
