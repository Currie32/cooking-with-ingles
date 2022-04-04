import React from 'react';
import firebase from 'firebase';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,

} from 'react-router-dom';
import styled from 'styled-components';


import {makeStyles, withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@material-ui/core/Grid';

//import * as ROUTES from '../../constants/routes';
//import { withAuthentication } from '../Session';
import './App.css'


const CssTextField = withStyles({
  root: {
    backgroundColor: 'white',
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

const StyledIngredientsSection = styled.td`
  text-align: left;
  vertical-align: top;
  padding: 0px 30px;
  max-width: 400px;
`
const StyledIngredient = styled.div`
  margin-top: 12px;
  line-height: 20px;
`
const StyledInstructionsSection = styled.td`
  text-align: justify;
  max-width: 600px;
  padding: 0px 30px;
  vertical-align: top;
`
const StyledInstruction = styled.div`
  margin-top: 10px;
`
const StyledImage = styled.td`
  vertical-align: top;
  padding: 0px 30px;
`


function App() {

  const [recipes, setRecipes] = React.useState({})
   React.useEffect(() => {
     async function fetchData() {
       const readRecipes = firebase.functions().httpsCallable('read_recipes');
       const response = await readRecipes().then(response => response.data)
       console.log(Object.entries(response))
       setRecipes(response)
     }
     fetchData()
   }, [])

   const [searchText, setSearchText] = React.useState("")
   const getSearchText = (text) => {setSearchText(text)
     if (!text) {setSearchText('')}
     else if (text.target.value === '') {setSearchText('')}
     else {setSearchText(text.target.value)}
   }

  return (
    <div className="App">
      <header className="App-header">
        <Grid container spacing={3}>

          <Grid item xs={12}>
            Hello Ingles!
          </Grid>

          <Grid item xs={12}>
            <CssTextField
                fullWidth variant="outlined" size='small' placeholder={'Filter recipes'} onChange={getSearchText} value={searchText}
              />
            {Object.keys(recipes).length > 0 &&
              Object.values(recipes).filter(recipe => recipe.title.toLowerCase().includes(searchText.toLowerCase())).map((recipe, index_recipe) => (
                <Accordion key={index_recipe}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>{recipe.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>
                      <table>
                        <tr>
                          <StyledIngredientsSection>
                            <div>
                            {recipe.ingredients.map((ingredient, index_ingredient) => (
                              <StyledIngredient key={index_ingredient}>{ingredient}</StyledIngredient>
                            ))}
                            </div>
                          </StyledIngredientsSection>
                          <StyledInstructionsSection>
                          <div>
                            {recipe.instructions.map((instruction, index_instruction) => (
                              <StyledInstruction key={index_instruction}>{instruction}</StyledInstruction>
                            ))}
                          </div>
                          </StyledInstructionsSection>
                          <StyledImage>
                            <img src={recipe.image} alt="new" width="400px" height="auto" object-fit="cover" />
                          </StyledImage>
                        </tr>
                      </table>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )
            )}
          </Grid>
        </Grid>

      </header>
    </div>
  );
}

export default App;
