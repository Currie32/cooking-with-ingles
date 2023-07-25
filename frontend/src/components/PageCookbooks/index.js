import { getFunctions, httpsCallable } from 'firebase/functions';
import CircularProgress from '@material-ui/core/CircularProgress';
import styled from 'styled-components';
import { useEffect, useState } from "react";
import CreatableSelect from "react-select";

import cookbooks from '../../constants/cookbooks.json';


const Content = styled.div`
  margin: auto;
  max-width: 700px;
`;
const menuStyles = {
  control: (styles, state) => ({
    ...styles,
    marginTop: "120px",
    height: "40px",
    boxShadow: 0,
    borderColor: state.isFocused ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.2)",
    "&:hover": {
      borderColor: state.isFocused ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)"
    }
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isSelected ? 'rgba(79, 118, 226, 0.3)': isFocused ? 'rgba(79, 118, 226, 0.2)': null
    }
  },
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      backgroundColor: 'rgba(0, 0, 0, 0)',
      border: '1.5px solid rgba(79, 118, 226, 0.6)',
      borderRadius: '10px',
      padding: '3px'
    };
  },
  placeholder: (defaultStyles) => {
    return {
      ...defaultStyles,
      color: "rgba(0, 0, 0, 0.35)",
      fontSize: "17px",
      paddingLeft: "5px",
    }
  }
}
const StyledRecipeSection = styled.div`
    margin-top: 30px;
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
  @media (max-width: 499px) {font-size: 15px};
`;
const StyledPageNumber = styled.div`
    font-size: 16px;
    margin: 7px 0px -5px;
    color: rgb(59, 61, 123);
`;
const StyledIngredients = styled.div`
    display: flex;
    margin: 10px 0px 5px;
    color: rgb(70, 70, 70);
`;
const StyledIngredientsTitle = styled.div`
    font-weight: 500;
    margin-right: 20px;
    color: rgb(0, 0, 0);
`;


export default function PageCookbooks({cookbookFromSearch}) {

  const functions = getFunctions();

  const [loadingSearch, setLoadingSearch] = useState(false)
  const [recipes, setRecipes] = useState(false)

  const [loadCookbook, setLoadCookbook] = useState(false)
  const getCookbook = (selectedCookbook) => {
    if (selectedCookbook === null) {setRecipes([])}
    else {
      setRecipes(false)
      setLoadingSearch(true)
      setLoadCookbook(selectedCookbook.value)
      window.localStorage.setItem('cookbookCookbooks', JSON.stringify(selectedCookbook.value))
    }
  }

  useEffect(() => {
    if (cookbookFromSearch) {
      setRecipes(false)
      setLoadingSearch(true)
      setLoadCookbook(cookbookFromSearch)
      window.localStorage.setItem('cookbookCookbooks', JSON.stringify(cookbookFromSearch))
    }
  }, [cookbookFromSearch])

  useEffect(() => {
    async function fetchData() {
      if (loadCookbook) {
        const readCookbook = httpsCallable(functions, 'read_cookbook');
        await readCookbook({cookbook: loadCookbook}).then(response => {
          setLoadingSearch(false)
          setRecipes(response.data.recipes)
          window.localStorage.setItem('recipesCookbooks', JSON.stringify(response.data.recipes))
        })
      }
    }
    fetchData()
  }, [loadCookbook])

  useEffect(() => {
    const storedLoadCookbook = window.localStorage.getItem('cookbookCookbooks');
    const storedRecipesCookbook = window.localStorage.getItem('recipesCookbooks');
    if ( storedLoadCookbook !== null ) {setLoadCookbook(JSON.parse(storedLoadCookbook))};
    if ( storedRecipesCookbook !== null ) {
      setLoadingSearch(false)
      setRecipes(JSON.parse(storedRecipesCookbook))
    };
  }, []);

  return (
    <Content>
      <CreatableSelect
        components={{DropdownIndicator: null}}
        options={cookbooks}
        value={loadCookbook ? [loadCookbook].map(v => {return ({label: v, value: v})}) : false}
        onChange={getCookbook}
        placeholder={'See all the recipes from a cookbook'}
        styles={menuStyles}
      />
        
      {loadingSearch && <div style={{justifyContent: 'center', display: 'flex', marginTop: '100px'}}>
          <CircularProgress/>
      </div>}

      {recipes?.length > 0 && <StyledRecipeSection>
        {recipes?.map((recipe, index) => (
          <StyledRecipe key={index}>
            <StyledRecipeName>{recipe.title}</StyledRecipeName>
            <StyledPageNumber>Page: {recipe.page}</StyledPageNumber>
            <StyledIngredients>
              <StyledIngredientsTitle>Ingredients:</StyledIngredientsTitle>
                {recipe.ingredients.join(', ')}
            </StyledIngredients>
          </StyledRecipe>
        ))}
      </StyledRecipeSection>}
    </Content>
  );
}
