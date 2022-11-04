import React from 'react';
import firebase from 'firebase';
import {Link} from 'react-router-dom';
import styled from 'styled-components';
import { styled as styledMUI } from '@mui/material/styles';

import {withStyles} from '@material-ui/core/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import TextField from '@material-ui/core/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Hidden from '@material-ui/core/Hidden';

import '../../App.css'


const StyledPage = styled.div`
  min-height: 580px;
  margin: 0px 20px;
`;
const StyledButtonAddRecipe = styled.div`
  margin: 120px auto 20px;
  width: 300px;
`
const ButtonAddRecipe = styledMUI(Button)({
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


const StyledRecipeTopInfo = styled.div`
  display: flex;
  width: 100%;
  @media (max-width: 1280px) {
    display: block;
  }
`;
const StyledTotalTime = styled.div`
  text-align: left;
  font-size: 18px;
  padding: 0px 80px 10px;
  font-weight: 550;
  @media (max-width: 1280px) {
    text-align: center;
  }
`
const StyledRecipeLink = styled.div`
  text-align: left;
  font-size: 18px;
  padding: 0px 80px 20px;
  @media (max-width: 1280px) {
    text-align: center;
  }
`
const StyledDeleteRecipe = styled.div`
  position: absolute;
  right: 50px;
  @media (max-width: 1280px) {
    position: relative;
    margin: 0px auto 20px;
    right: 0px;
  }
`;
const StyledRecipeInfo = styled.div`
  display: flex;
  @media (max-width: 960px) {
    display: block;
    width: 100%;
  }
`;
const StyledIngredientsSection = styled.div`
  text-align: left;
  vertical-align: top;
  padding: 0px 30px;
  max-width: 400px;
  @media (max-width: 1280px) {
    display: block;
  }
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
  @media (max-width: 1280px) {
    display: block;
  }
`
const StyledInstruction = styled.div`
  margin-top: 10px;
`
const StyledImage = styled.td`
  vertical-align: top;
  padding: 0px 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 1280px) {
    margin: 0px auto 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
const StyledImageImg = styled.img`
  width: 375px;
  @media (max-width: 1280px) {width: 325px}
  @media (max-width: 1000px) {width: 300px}
  @media (max-width: 900px) {width: 275px}
  @media (max-width: 800px) {width: 250px}
`;
const StyledDialog = styled.div`
  width: 500px;
  padding: 20px 30px;
  @media (max-width: 600px) {width: 450px}
  @media (max-width: 550px) {width: 400px}
  @media (max-width: 500px) {width: 350px}
  @media (max-width: 450px) {width: 300px}
  @media (max-width: 400px) {width: 250px}
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
const StyledRecipeLoading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 60px auto 10px;
`
const StyledAddRecipeText = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0px auto -10px;
`
const StyledLink = styled(Link)`
  text-decoration: underline;
  :hover {text-decoration: underline}
`;
const StyledResultsSection = styled.div`
  overflow-x: hidden;
  overflow-y: scroll;
  height: 360px;
  margin: 25px auto;
  @media (max-width: 499px) {height: 335px}
`;


function sortByTitle( a, b ) {
  if ( a.title < b.title ){
    return -1;
  }
  if ( a.title > b.title ){
    return 1;
  }
  return 0;
}


export default function PageHome({uid}) {

  const [loadingRecipes, setLoadingRecipes] = React.useState(false)
  // var data = require('../../data.json');
  // const [recipes, setRecipes] = React.useState(data)
  const [recipes, setRecipes] = React.useState({})
  React.useEffect(() => {
    if (uid) {
      setLoadingRecipes(true)
      setRecipes({})
      async function fetchData() {
        const readRecipes = firebase.functions().httpsCallable('read_recipes');
        let response = await readRecipes({uid: uid}).then(response => response.data)
        setLoadingRecipes(false)
        setRecipes(response)
      }
      fetchData()
    }
  }, [uid])

  const [searchText, setSearchText] = React.useState("")
  const getSearchText = (text) => {
    if (!text) {setSearchText('')}
    else if (text.target.value === '') {setSearchText('')}
    else {setSearchText(text.target.value)}
  }

  const [createAccount, setCreateAccount] = React.useState(false)
  const [invalidURL, setInvalidURL] = React.useState(false)
  const [url, setUrl] = React.useState(false)
  const [loadingUpdateRecipes, setLoadingUpdateRecipes] = React.useState(false)
  const [updateRecipes, setUpdateRecipes] = React.useState(false)
  const getUpdateRecipes = (toUpdate) => {

    if (uid === 'default') {
      setCreateAccount(true)
    }
    else {
      setLoadingUpdateRecipes(true)
      setInvalidURL(false)
      setUpdateRecipes(url)
    }
  }
  React.useEffect(() => {
    async function fetchData() {
      if (url) {
        const addRecipe = firebase.functions().httpsCallable('add_recipe');
        await addRecipe({url: url, uid: uid}).then(response => {
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

  const handleClickOpen = () => {
    setOpen(true)};

  const handleClose = (value) => {
    setOpen(false);
    setInvalidURL(false)
    setUrl(false)
  };

  const [recipeToDelete, setRecipeToDelete] = React.useState(false)
  const [deleteRecipe, setDeleteRecipe] = React.useState(false)
  const getDeleteRecipe = (event, valueNew) => {setDeleteRecipe(event)}
  const [openDeleteRecipe, setOpenDeleteRecipe] = React.useState(false);
  const handleClickOpenDeleteRecipe = (recipe) => {
    setOpenDeleteRecipe(true)
    setRecipeToDelete(recipe)
  };
  const handleCloseDeleteRecipe = () => {setOpenDeleteRecipe(false);};

  React.useEffect(() => {
    setOpenDeleteRecipe(false)
    if (deleteRecipe && recipeToDelete) {
      const filteredRecipes = Object.keys(recipes)
        .filter(recipe => recipeToDelete !== recipe)
        .reduce((obj, key) => {
            obj[key] = recipes[key];
            return obj;
        }, {});
      setRecipes(filteredRecipes)
      setDeleteRecipe(true)

      async function fetchData() {
        const deleteRecipe = firebase.functions().httpsCallable('delete_recipe');
        await deleteRecipe({recipes: filteredRecipes, uid: uid}).then(response => {
          setDeleteRecipe(false)
        })
      }
      fetchData()
    }
  }, [deleteRecipe])

  return (
    <StyledPage className="App">
        <Grid container spacing={3}>

          <StyledButtonAddRecipe>
            <ButtonAddRecipe color="success" variant="outlined" onClick={handleClickOpen}>
              Add recipe
            </ButtonAddRecipe>
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

              {createAccount && <StyledAddRecipeText>
                <p style={{fontSize: '16px'}}><StyledLink to={{pathname: "/sign-up"}}>Create an account</StyledLink> to add your own recipes.</p>
              </StyledAddRecipeText>}

            </StyledDialog>
          </Dialog>

          <Grid item xs={12}>
            <CssTextField
              fullWidth variant="outlined" size='small' placeholder={'Filter recipes (e.g. Thai, noodles, coconut milk, etc.)'} onInput={getSearchText} value={searchText}
            />
            {loadingRecipes && <StyledRecipeLoading>
              <CircularProgress/>
            </StyledRecipeLoading>}
            {Object.keys(recipes).length > 0 && <StyledResultsSection>
              {Object.values(recipes).sort(sortByTitle).filter(
                recipe => (searchText.split(',').every(
                  i => (recipe.title.toLowerCase().concat(', ', String(recipe.ingredients).toLowerCase())).includes(i)
                ))
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

                      <StyledRecipeTopInfo>
                        <div>
                          {recipe.total_time && <StyledTotalTime>Total time: {recipe.total_time} minutes</StyledTotalTime>}
                          <StyledRecipeLink><a target="_blank" href={recipe.url}>Link to recipe's website</a></StyledRecipeLink>
                        </div>
                        <StyledDeleteRecipe>
                          <Button variant="outlined" size="small" color="error" onClick={() => handleClickOpenDeleteRecipe(recipe.title)}>
                            Delete recipe
                          </Button>
                          <Dialog open={openDeleteRecipe} onClose={handleCloseDeleteRecipe}>
                            {uid !== 'default' && <div>
                              <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                  Are you sure you want to delete that recipe?
                                </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={() => getDeleteRecipe(true)}>Yes</Button>
                                <Button onClick={() => getDeleteRecipe(false)}>No</Button>
                              </DialogActions>
                            </div>}
                            {uid === 'default' && <div>
                              <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                  <StyledLink to={{pathname: "/sign-up"}}>Create an account</StyledLink> to add your own recipes.
                                </DialogContentText>
                              </DialogContent>
                            </div>}
                          </Dialog>
                        </StyledDeleteRecipe>
                      </StyledRecipeTopInfo>
                      <Hidden lgUp>
                        <StyledImage>
                            <StyledImageImg src={recipe.image} alt="new" height="auto"  />
                        </StyledImage>
                      </Hidden>
                      <StyledRecipeInfo>

                        <StyledIngredientsSection>
                          <div>
                          {recipe.ingredients.map((ingredient, index_ingredient) => (
                            <StyledIngredient key={index_ingredient}>{ingredient}</StyledIngredient>
                          ))}
                          </div>
                        </StyledIngredientsSection>
                        <Hidden mdUp>
                          <hr style={{
                            border: '0.5px solid rgba(0, 0, 0, 0.5)',
                            margin: '40px auto',
                            width: '40px'
                          }}/>
                        </Hidden>
                        <StyledInstructionsSection>
                        <div>
                          {recipe.instructions.map((instruction, index_instruction) => (
                            <StyledInstruction key={index_instruction}>{instruction}</StyledInstruction>
                          ))}
                        </div>
                        </StyledInstructionsSection>
                        <Hidden mdDown>
                          <StyledImage>
                            <div>
                              <StyledImageImg src={recipe.image} alt="new" height="auto" object-fit="cover" />
                            </div>
                          </StyledImage>
                        </Hidden>
                      </StyledRecipeInfo>
                    </Typography>
                  </AccordionDetails>
                </Accordion>

              ))}
            </StyledResultsSection>}

            <div style={{marginBottom: '30px'}}></div>
          </Grid>
        </Grid>
    </StyledPage>
  );
}
