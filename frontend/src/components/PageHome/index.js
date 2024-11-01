import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import {Dialog} from '@mui/material';
import Typography from '@mui/material/Typography';
import { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from 'styled-components';
import Button from '@mui/material/Button';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { createFilterOptions } from '@mui/material/Autocomplete';

import options from './searchTerms.json';

const filterAutocomplete = createFilterOptions();


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
  border: 1px solid rgba(59, 61, 123, 0.2);
  border-radius: 10px;
  padding: 10px;
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
const StyledGeneratedRecipeIngredientsAndInstructions = styled.div`
  display: flex;
  @media (max-width: 599px) {display: block}
`;
const StyledNoRecipes = styled.div`
    margin-top: 60px;
    text-align: center;
    font-style: italic;
    font-size: 17px;
`;
const StyledGeneratedRecipeTitle = styled.h1`
  color: rgb(59, 61, 123);
  margin: 15px 20px;
`
const StyledGeneratedRecipeSubTitle = styled.h2`
  color: rgb(59, 61, 123);
  margin: 15px 0px;
`
const StyledGeneratedRecipeInfo = styled.div`
  margin: 5px 20px;
`

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

  const db = getFirestore();
  const functions = getFunctions();

  const [checked, setChecked] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [recipes, setRecipes] = useState(false);
  const [getRecipesClicked, setGetRecipesClicked] = useState(false);
  const [searchTerms, setSearchTerms] = useState({});
  const [searchOptions, setSearchOptions] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState('');
  const [openGeneratedRecipe, setOpenGeneratedRecipe] = useState(false);
  const [loadingGeneratedRecipe, setLoadingGeneratedRecipe] = useState(false);
  const [notLoggedInMessageCheckbox, setNotLoggedInMessageCheckbox] = useState(false)
  const [notLoggedInMessageRecipeList, setNotLoggedInMessageRecipeList] = useState(false)

  useEffect(() => {
    if (uid === "default") {setChecked(false)}
    else {
      setNotLoggedInMessageCheckbox(false)
      setNotLoggedInMessageRecipeList(false)
    }
  }, [uid])


  const [userRecipeLists, setUserRecipeLists] = useState({});
  const [userRecipeCategories, setUserRecipeCategories] = useState([]);
  const handleCategoryChange = (event, value, recipeId) => {
    const filteredValue = value.map((option) => {
      if (option?.label?.startsWith('Create new list: ')) {
        return option?.label.slice('Create new list: '.length).replace(/['"]+/g, '');
      }
      return option.replace(/['"]+/g, '');
    })
    setUserRecipeLists((prev) => ({
      ...prev,
      [recipeId]: filteredValue,
    }));
  };

  useEffect(() => {
    setUserRecipeCategories([...new Set(Object.values(userRecipeLists).flat())]);

    const updateRecipeLists = async () => {  
      await setDoc(doc(db, 'users_recipe_lists', uid), userRecipeLists);
    };
    if (uid) {updateRecipeLists()};
  }, [userRecipeLists]);


  const [updatedOptions, setUpdatedOptions] = useState([]);
  useEffect(() => {
    const mappedCategories = userRecipeCategories.map((category) => {
        return { name: category, group: 'Recipe list' };
    });
    const updatedOptionsNew = mappedCategories.concat(options);
    setUpdatedOptions(updatedOptionsNew);
}, [userRecipeCategories, options]);
  

  useEffect(() => {
    const fetchRecipeList = async () => {
      try {
        const docRef = doc(db, 'users_recipe_lists', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {setUserRecipeLists(docSnap.data())}
        else {setUserRecipeLists({})}
      } catch (err) {
        console.log(err);
      }
    };
    if (uid) {fetchRecipeList()}
  }, [uid]);


  const getChecked = (event) => {
    if (uid === "default") {
      setNotLoggedInMessageCheckbox(true)
    }
    else {
      setChecked(event.target.checked);
      setGetRecipesClicked(true)
      if (Object.keys(searchTerms).length > 0) {
        setRecipes(false)
        setLoadingSearch(true)
      }
      window.localStorage.setItem('searchCheckedHome', JSON.stringify(event.target.value))
    }
  };

  const getRecipes = () => {
    setGetRecipesClicked(true)
    setLoadingSearch(true)
  }

  const getSearchTerms = (terms) => {
    if (!terms) {
      setSearchTerms({})
      setSearchOptions([])
      window.localStorage.setItem('searchTermsHome', JSON.stringify({}))
      window.localStorage.setItem('searchOptionsHome', JSON.stringify([]))

      // Clear search terms from the URL
      const url = new URL(window.location);
      url.searchParams.delete('search');
      window.history.replaceState(null, '', url);
    }
    else {
      const searchTermsNew = mapTermsToGroups(terms);
      const searchOptionsNew = terms.map(term => term.name)
      setSearchTerms(searchTermsNew);
      setSearchOptions(searchOptionsNew)
      window.localStorage.setItem('searchTermsHome', JSON.stringify(searchTermsNew))
      window.localStorage.setItem('searchOptionsHome', JSON.stringify(searchOptionsNew))

      // Add search terms to the URL
      const url = new URL(window.location);
      url.searchParams.set('search', JSON.stringify(searchTermsNew));
      window.history.replaceState(null, '', url);
    }
  }

  useEffect(() => {
    const url = new URL(window.location);
    const searchParams = url.searchParams.get('search');
    
    if (searchParams) {
      try {
        const searchTermsFromUrl = JSON.parse(searchParams);
        const searchOptionsFromUrl = Object.values(searchTermsFromUrl).flat()

        setChecked(false)
        setSearchTerms(searchTermsFromUrl);
        setSearchOptions(searchOptionsFromUrl);
        window.localStorage.setItem('searchTermsHome', JSON.stringify(searchTermsFromUrl));
        window.localStorage.setItem('searchOptionsHome', JSON.stringify(searchOptionsFromUrl));
        
        setLoadingSearch(true)
        setGetRecipesClicked(true);
      } catch (error) {
        console.error("Failed to parse search terms from URL:", error);
      }
    }
  }, []);

  useEffect(() => {
    setRecipes(false);
    if (Object.keys(searchTerms).length > 0 && getRecipesClicked) {
      setGetRecipesClicked(false);
      async function getData() {

        const userRecipeListIds = searchTerms["recipe list"]?.reduce((acc, term) => {
          const matchingIds = Object.entries(userRecipeLists)
              .filter(([_, listName]) => listName.includes(term))
              .map(([id]) => id);
          return [...acc, ...matchingIds];
        }, []);

        const getRecipesV2 = httpsCallable(functions, 'get_recipes_v2');
        const response = await getRecipesV2({
          searchTerms: searchTerms,
          userCookbooks: checked ? userCookbooks : [],
          userRecipeListsIds: userRecipeListIds,
        }).then(response => response.data.recipes);
        setRecipes(response);
        window.localStorage.setItem('recipesHome', JSON.stringify(response));
        setLoadingSearch(false);
      }
      getData();
    }
  }, [getRecipesClicked]);

  useEffect(() => {
    const storedSearchTerms = window.localStorage.getItem('searchTermsHome');
    const storedSearchOptions = window.localStorage.getItem('searchOptionsHome');
    const storedRecipes = window.localStorage.getItem('recipesHome');
    const storedChecked = window.localStorage.getItem('searchCheckedHome');
    if (storedSearchTerms !== null) setSearchTerms(JSON.parse(storedSearchTerms));
    if (storedSearchOptions !== null) setSearchOptions(JSON.parse(storedSearchOptions));
    if (storedRecipes !== null) setRecipes(JSON.parse(storedRecipes));
    // if (storedChecked !== null) setChecked(JSON.parse(storedChecked));
  }, []);

  const handleGenerateRecipe = async (title, ingredients) => {
    setOpenGeneratedRecipe(true);
    if (generatedRecipe.title?.toLowerCase() !== title.toLowerCase()) {
      setLoadingGeneratedRecipe(true);
      try {
        const generateRecipe = httpsCallable(functions, 'generate_recipe');
        const response = await generateRecipe({
          title: title,
          ingredients: ingredients,
        }).then(response => response.data);
        setLoadingGeneratedRecipe(false);
        setGeneratedRecipe(response)
      } catch (error) {
        setOpenGeneratedRecipe(false);
        setLoadingGeneratedRecipe(false);
        console.error('Error generating recipe:', error);
      }
    }
  };

  const handleCloseGeneratedRecipe = () => {
    setOpenGeneratedRecipe(false);
  };
  
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
        label={option?.name}
        style={{
          backgroundColor: 'white',
          border: '1px solid rgb(58, 60, 123)',
          color: 'rgb(58, 60, 123)',
          '&:hover': {
            backgroundColor: 'rgba(58, 60, 123, 0.5)',
          },
        }}
        deleteIcon={<CancelIcon style={{ color: 'rgb(58, 60, 123)' }} />}
      />
    ));

    const renderTagsDark = (value, getTagProps) => 
    value.map((option, index) => (
      <Chip
        {...getTagProps({ index })}
        label={option}
        style={{
          backgroundColor: 'rgba(59, 61, 123, 1)',
          color: 'rgb(255, 255, 255)',
          '&:hover': {
            backgroundColor: 'rgba(58, 60, 123, 0.5)',
          },
        }}
        deleteIcon={<CancelIcon style={{ color: 'rgb(255, 255, 255)', }} />}
      />
    ));

  const [searchText, setSearchText] = useState('');
  const [searchTextTimer, setSearchTextTimer] = useState(Date.now());
  const getSearchText = (inputValue) => {
    if (inputValue) {
      setSearchText(inputValue);
      setSearchTextTimer(Date.now());
    }
    else if (Date.now() - searchTextTimer > 200) {
      setSearchText(inputValue);
      setSearchTextTimer(Date.now());
    }
  }

  const [openStates, setOpenStates] = useState({});
  const handleIconClick = (id) => {
    setOpenStates((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  
  return (
    <Content>
      <StyledSearchBox>
        <Autocomplete
          multiple
          id="tags-standard"
          autoHighlight={true}
          options={updatedOptions
            .filter(option => !searchOptions.includes(option.name))
            .filter(option => option.name.toLowerCase().includes(searchText.toLowerCase()))
            .slice(0, 200)
          }
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
          sx={{ width: "100%", marginRight: "15px" }}
          value={searchOptions.map((option) => updatedOptions.find((o) => o.name === option))}
          onChange={(event, value) => getSearchTerms(value.map((option) => option))}
          onInputChange={(event, inputValue) => {getSearchText(inputValue)}}
          inputValue={searchText}
        />
        <Button variant="contained" color="primary" disabled={Object.keys(searchTerms).length === 0} sx={{height: "50px", width: "40px", backgroundColor: "rgb(59, 61, 123)"}} onClick={getRecipes}>
          <KeyboardReturnIcon/>
        </Button>
      </StyledSearchBox>
      <StyledCheckbox>
          <Checkbox checked={checked} onChange={getChecked} inputProps={{ 'aria-label': 'controlled' }} 
            sx={{color: "rgb(59, 61, 123)", '&.Mui-checked': {color: "rgb(59, 61, 123)"}}}
          />
          <StyledCheckboxText>Search with only your cookbooks</StyledCheckboxText>
      </StyledCheckbox>
      {notLoggedInMessageCheckbox && <p style={{
        backgroundColor: "rgba(59, 61, 123, 0.9)",
        borderRadius: "5px",
        color: "white",
        marginTop: "-5px",
        maxWidth: "300px",
        padding: "5px 10px"
      }}>Log in to search using your own cookbooks</p>}

      <StyledRequest>
        Want to search another cookbook? Request it by <a target="_blank" rel="noreferrer" href="https://docs.google.com/forms/d/e/1FAIpQLSfPveAlQDH0RIx0qWWmibA2nKxq7Rl7wIFn6j_Mysba1iZJlQ/viewform">clicking here.</a>
      </StyledRequest>

      {loadingSearch && <Grid item xs={12} style={{justifyContent: 'center', display: 'flex', marginTop: '100px'}}>
          <CircularProgress/>
      </Grid>}

      {recipes?.length > 0 && <StyledRecipeSection>
          {recipes?.map((recipe, index) => (
              <StyledRecipe key={index}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <StyledRecipeName>{recipe.title}</StyledRecipeName>
                  <Button
                    sx={{
                      fontSize: "10px",
                      backgroundColor: "rgb(59, 61, 123)",
                      '&:hover': {
                        backgroundColor: "rgb(39, 41, 83)",
                      },
                      border: "1px solid rgb(59, 61, 123)",
                      color: "white",
                      float: "right",
                      fontSize: {xs: '8px',  sm: '10px'},
                      marginBottom: {xs: '5px',  sm: '0px'},
                    }}
                    onClick={() => handleGenerateRecipe(recipe.title, recipe.ingredients)}
                  >
                    Generate a recipe like this
                  </Button>
                </div>
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
                <div style={{display: 'flex'}}>
                  {((Object.keys(openStates).length === 0 || !openStates[recipe.id]) && !userRecipeLists[recipe.id]?.length > 0) && <PlaylistAddIcon 
                    onClick={() => handleIconClick(recipe.id)} 
                    sx={{
                      cursor: 'pointer',
                      color: 'rgb(59, 61, 123)',
                      borderRadius: '50%',
                      marginBottom: openStates[recipe.id] ? '10px' : '0px',
                      marginTop: 'auto',
                      marginRight: '20px',
                      padding: '5px',
                      '&:hover': {
                        backgroundColor: 'rgba(59, 61, 123, 0.2)',
                      },
                      '&:active': {
                        backgroundColor: 'rgba(59, 61, 123, 0.3)',
                      }
                    }} 
                  />}
                  {(openStates[recipe.id] || (userRecipeLists[recipe.id]?.length > 0)) && (
                    uid === "default" ? (
                      <p style={{
                        backgroundColor: "rgba(59, 61, 123, 0.9)",
                        borderRadius: "5px",
                        color: "white",
                        padding: "5px 10px",
                        maxWidth: "100%"
                      }}>
                        Log in to add recipes to a list
                      </p>
                    ) : (
                      <Autocomplete
                        multiple
                        autoSelect
                        freeSolo
                        options={userRecipeCategories.filter(category => !userRecipeLists[recipe.id]?.includes(category))}
                        openOnFocus
                        renderTags={renderTagsDark}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Add recipes to list(s)"
                            variant="outlined"
                          />
                        )}
                        filterOptions={(options, params) => {
                          const filtered = filterAutocomplete(options, params);
                          if (params.inputValue !== '' && !userRecipeCategories.some(category => category === params.inputValue)) {
                            filtered.push({
                              title: params.inputValue,
                              label: `Create new list: "${params.inputValue}"`,
                            });
                          }
                          return filtered;
                        }}
                        value={userRecipeLists[recipe.id] || []}
                        onChange={(event, value) => handleCategoryChange(event, value, recipe.id)}
                        style={{ width: "100%", marginTop: 10 }}
                      />
                    )
                  )}
                </div>
              </StyledRecipe>
          ))}
      </StyledRecipeSection>}
      {(generatedRecipe || loadingGeneratedRecipe) && <Dialog open={openGeneratedRecipe} onClose={handleCloseGeneratedRecipe} maxWidth="md">
        {loadingGeneratedRecipe && <div style={{justifyContent: 'center', display: 'flex', margin: '200px auto 0px', width: "800px", maxWidth: "100%", height: "350px"}}>
          <CircularProgress/>
        </div>}
        {!loadingGeneratedRecipe && <div>
          <StyledGeneratedRecipeTitle>{generatedRecipe.title}</StyledGeneratedRecipeTitle>
          <StyledGeneratedRecipeInfo>
            <Typography>Total time: {generatedRecipe.total_time}</Typography>
            <Typography style={{marginBottom: "10px"}}>Servings: {generatedRecipe.servings}</Typography>
            <StyledGeneratedRecipeIngredientsAndInstructions>
              <div style={{display: "block", width: "250px", marginRight: "40px"}}>
                <StyledGeneratedRecipeSubTitle>Ingredients</StyledGeneratedRecipeSubTitle>
                {generatedRecipe.ingredients.map((ingredient, index) => (
                  <Typography style={{marginBottom: "5px"}} key={index}>{ingredient}</Typography>
                ))}
              </div>
              <div style={{display: "block", width: "500px", maxWidth: "100%"}}>
                <StyledGeneratedRecipeSubTitle>Instructions</StyledGeneratedRecipeSubTitle>
                {generatedRecipe.instructions.split("\n").map((instruction, index) => (
                  <Typography style={{marginBottom: "15px"}} key={index}>{instruction}</Typography>
                ))}
              </div>
            </StyledGeneratedRecipeIngredientsAndInstructions>
          </StyledGeneratedRecipeInfo>  
        </div>}
      </Dialog>}
      {recipes?.length === 0 && <StyledNoRecipes>
          No recipes were found with these ingredients.
      </StyledNoRecipes>}
    </Content>
  );
}
