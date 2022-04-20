import React from 'react';
import firebase from 'firebase';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Redirect,

} from 'react-router-dom';
import styled from 'styled-components';

import {makeStyles, withStyles} from '@material-ui/core/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@material-ui/core/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

//import * as ROUTES from '../../constants/routes';
//import { withAuthentication } from '../Session';
import '../../App.css'



const StyledButtonAddRecipe = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto 10px;
`
const CssTextField = withStyles({
  root: {
    backgroundColor: 'white',
    marginBottom: '20px',
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


const StyledTotalTime = styled.div`
  text-align: left;
  font-size: 18px;
  padding: 0px 80px 10px;
  font-weight: 600;
`
const StyledRecipeLink = styled.div`
  text-align: left;
  font-size: 18px;
  padding: 0px 80px 20px;
`
const StyledIngredientsSection = styled.div`
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
const StyledDialog = styled.div`
  width: 500px;
  padding: 20px 30px;
`
const StyledAddRecipeTextField = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px auto 10px;
`
const StyledAddRecipeButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto 10px;
`
const StyledAddRecipeLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px auto 10px;
`
const StyledAddRecipeText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0px auto -10px;
`


export default function PageHome() {

  var data = require('../../data.json');
  const [recipes, setRecipes] = React.useState(data)
   // const [recipes, setRecipes] = React.useState({})
   // React.useEffect(() => {
   //   async function fetchData() {
   //     const readRecipes = firebase.functions().httpsCallable('read_recipes');
   //     const response = await readRecipes().then(response => response.data)
   //     setRecipes(response)
   //   }
   //   fetchData()
   // }, [])

  const [searchText, setSearchText] = React.useState("")
  const getSearchText = (text) => {
    if (!text) {setSearchText('')}
    else if (text.target.value === '') {setSearchText('')}
    else {setSearchText(text.target.value)}
  }

  const [invalidURL, setInvalidURL] = React.useState(false)
  const [url, setUrl] = React.useState(false)
  const [loadingUpdateRecipes, setLoadingUpdateRecipes] = React.useState(false)
  const [updateRecipes, setUpdateRecipes] = React.useState(false)
  const getUpdateRecipes = (toUpdate) => {
    setLoadingUpdateRecipes(true)
    setInvalidURL(false)
    setUpdateRecipes(url)
  }
  React.useEffect(() => {
    async function fetchData() {
      if (url) {
        const addRecipe = firebase.functions().httpsCallable('add_recipe');
        await addRecipe({url: url}).then(response => {
          setLoadingUpdateRecipes(false)
          if (response.data.success) {
            setRecipes(response.data.recipes)
            setOpen(false);
            setInvalidURL(false)
            setUrl(false)
          }
          else {
            setInvalidURL(true)
          }
        })
      }
    }
    fetchData()
  }, [updateRecipes])

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {setOpen(true)};

  const handleClose = (value) => {
    setOpen(false);
    setInvalidURL(false)
    setUrl(false)
  };

  return (
    <div className="App">
        <Grid container spacing={3}>

          <Grid item xs={12} style={{marginTop: '100px', fontSize: '24px'}}>
            Hello Ingles!
          </Grid>

          <StyledButtonAddRecipe>
            <Button variant="outlined" size="large" onClick={handleClickOpen}>
              Add recipe
            </Button>
          </StyledButtonAddRecipe>

          <Dialog open={open} onClose={handleClose}>
            <StyledDialog>
              <StyledAddRecipeTextField>
                <TextField fullWidth={true} id="outlined-basic" label="URL of recipe" variant="outlined" onChange={(event) => {setUrl(event.target.value)}} />
              </StyledAddRecipeTextField>

              <StyledAddRecipeButton>
                <Button variant="contained" size="large" onClick={getUpdateRecipes}>
                  Add recipe
                </Button>
              </StyledAddRecipeButton>

              {loadingUpdateRecipes && <StyledAddRecipeLoading>
                <CircularProgress/>
              </StyledAddRecipeLoading>}

              {invalidURL && <StyledAddRecipeText>
                <p style={{fontSize: '16px'}}>We're unable to get the recipe from this website, please try a different one.</p>
              </StyledAddRecipeText>}
            </StyledDialog>
          </Dialog>

          <Grid item xs={12}>
            <CssTextField
              fullWidth variant="outlined" size='small' placeholder={'Filter recipes (e.g. Thai, noodles, coconut milk, etc.)'} onChange={getSearchText} value={searchText}
            />
            {Object.keys(recipes).length > 0 &&
              Object.values(recipes).filter(
                recipe => searchText.split(',').every(
                  i => recipe.title.toLowerCase().concat(', ', String(recipe.ingredients).toLowerCase()).includes(i)
                )
              ).map((recipe, index_recipe) => (
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
                      <div>
                        {recipe.total_time && <StyledTotalTime>Total time: {recipe.total_time} minutes</StyledTotalTime>}
                        <StyledRecipeLink><a href={recipe.url}>Link to recipe's website</a></StyledRecipeLink>
                      </div>
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

    </div>
  );
}
