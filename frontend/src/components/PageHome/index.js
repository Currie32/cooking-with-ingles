import { getFunctions, httpsCallable } from 'firebase/functions';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import Button from '@mui/material/Button';

import options from './searchTerms.json';


const Content = styled.div`
  margin: auto;
  max-width: 700px;
`;
const StyledSearchBox = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 15px auto 0px;
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

const mapTermsToGroups = (terms) => {
  return terms.reduce((groupedTerms, currentTerm) => {
    const groupKey = currentTerm.group.toLowerCase(); // Convert group name to lowercase for consistency

    if (!groupedTerms[groupKey]) {
      groupedTerms[groupKey] = []; // Initialize the group array if it doesn't exist
    }

    groupedTerms[groupKey].push(currentTerm.name); // Add the item name to the group array

    return groupedTerms; // Return the updated groupedItems object
  }, {});
};


export default function PageHome({uid, userCookbooks, getCookbookFromSearch}) {

  const functions = getFunctions();

  const [checked, setChecked] = useState(false);
  const getChecked = (event) => {
    setChecked(event.target.checked);
    setRecipes(false)
    setLoadingSearch(true)
    window.localStorage.setItem('searchCheckedHome', JSON.stringify(event.target.value))
  };

  const [loadingSearch, setLoadingSearch] = useState(false)
  const [recipes, setRecipes] = useState(false)
  const [getRecipesClicked, setGetRecipesClicked] = useState(false)
  const getRecipes = () => {
    setGetRecipesClicked(true)
    setLoadingSearch(true)
  }
  const [searchTerms, setSearchTerms] = useState([])
  const [searchOptions, setSearchOptions] = useState([])
  const getSearchTerms = (terms) => {
    console.log(terms)
    if (!terms) {
      setSearchTerms({})
      setSearchOptions([])
      window.localStorage.setItem('searchTermsHome', JSON.stringify({}))
      window.localStorage.setItem('searchOptionsHome', JSON.stringify([]))
    }
    else {
      const searchTermsNew = mapTermsToGroups(terms);
      const searchOptionsNew = terms.map(term => term.name)
      setSearchTerms(searchTermsNew);
      setSearchOptions(searchOptionsNew)
      window.localStorage.setItem('searchTermsHome', JSON.stringify(searchTermsNew))
      window.localStorage.setItem('searchOptionsHome', JSON.stringify(searchOptionsNew))
    }
  }

  useEffect(() => {
    setRecipes(false)
    console.log(searchTerms)
    if (searchTerms && getRecipesClicked) {
      setGetRecipesClicked(false)
      async function getData() {
        const getRecipesV2 = httpsCallable(functions, 'get_recipes_v2');
        if (checked) {
            const response = await getRecipesV2(
                {searchTerms: searchTerms, userCookbooks: userCookbooks}
            ).then(response => response.data.recipes)
            setRecipes(response)
            window.localStorage.setItem('recipesHome', JSON.stringify(response))
            setLoadingSearch(false)
        }
        else {
            const response = await getRecipesV2(
                {searchTerms: searchTerms, userCookbooks: []}
            ).then(response => response.data.recipes)
            setRecipes(response)
            window.localStorage.setItem('recipesHome', JSON.stringify(response))
            setLoadingSearch(false)
        }
      }
      getData()
    }
  }, [getRecipesClicked])

  useEffect(() => {
    if (uid === "default") {setChecked(false)}
  }, [uid])

  useEffect(() => {
    const storedSearchTerms = window.localStorage.getItem('searchTermsHome');
    const storedSearchOptions = window.localStorage.getItem('searchOptionsHome');
    const storedRecipes = window.localStorage.getItem('recipesHome');
    const storedChecked = window.localStorage.getItem('searchCheckedHome');
    if ( storedSearchTerms !== null ) setSearchTerms(JSON.parse(storedSearchTerms));
    if ( storedSearchOptions !== null ) setSearchOptions(JSON.parse(storedSearchOptions));
    if ( storedRecipes !== null ) setRecipes(JSON.parse(storedRecipes));
    if ( storedChecked !== null ) setChecked(JSON.parse(storedChecked));
  }, []);
  
  const renderGroup = (params) => [
    <li key={params.key} style={{ color: 'rgba(79, 118, 226, 1)', fontWeight: 'bold', fontSize: '1.1em', marginLeft: '15px' }}>
      <Typography variant="subtitle1">{params.group}</Typography>
    </li>,
    params.children,
  ];

  const renderTags = (value, getTagProps) => 
    value.map((option, index) => (
      <Chip
        {...getTagProps({ index })}
        label={option.name}
        style={{
          backgroundColor: 'white',
          border: '1px solid rgb(58, 60, 123)',
          color: 'rgb(58, 60, 123)',
          // Change background color on hover
          '&:hover': {
            backgroundColor: 'rgba(58, 60, 123, 0.5)',
          },
        }}
        deleteIcon={<CancelIcon style={{ color: 'rgb(58, 60, 123)' }} />}
      />
    ));

  return (
    <Content>
      <StyledSearchBox>
        <Autocomplete
          multiple
          id="tags-standard"
          openOnFocus={true}
          autoHighlight={true}
          options={options.filter(option => !searchOptions.includes(option.name))}
          groupBy={(option) => option.group}
          getOptionLabel={(option) => option.name}
          renderGroup={renderGroup}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label="Search for recipes"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <Fragment>
                    {params.InputProps.endAdornment}
                  </Fragment>
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <span style={{ marginLeft: "10px"}}>{option.name}</span>
            </Box>
          )}
          renderTags={renderTags}
          // Set width to 600px
          sx={{ width: "100%", marginRight: "15px" }}
          value={searchOptions.map((option) => options.find((o) => o.name === option))}
          onChange={(event, value) => getSearchTerms(value.map((option) => option))}
        />
        <Button variant="contained" color="primary" sx={{height: "50px", width: "40px", backgroundColor: "rgb(59, 61, 123)"}} onClick={getRecipes}>
          <KeyboardReturnIcon/>
        </Button>
      </StyledSearchBox>
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
