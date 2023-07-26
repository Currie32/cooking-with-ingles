import { getAnalytics, logEvent } from 'firebase/analytics';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import * as ROUTES from '../../constants/routes';


const StyledHeader = styled.h1`
  fontSize: 36px;
  text-align: center;
  margin-bottom: 30px;
`;
const StyledTextField = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 15px auto 0px;
  max-width: 600px;
`;
const StyledCheckbox = styled.div`
  display: flex;
  justify-content: left;
  align-items: left;
  margin: 15px auto 0px;
  max-width: 600px;
`;
const CheckboxTerms = withStyles({
  root: {
    color: "rgba(0, 44, 25, 0.98)",
    '&$checked': {color: "rgba(0, 44, 25, 0.98)"},
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);
const StyledButton = styled.div`
  margin: 15px auto 50px;
  max-width: 600px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const StyledButtonCSS = withStyles((theme) => ({
  fontSize: '18px',
  root: {
    borderColor: 'rgba(79, 118, 226, 0.5)',
    backgroundColor: 'rgba(79, 118, 226, 0.1)',
    color: 'rgba(79, 118, 226, 1)',
    '&:hover': {
      backgroundColor: 'rgba(79, 118, 226, 0.2)',
      borderColor: 'rgba(79, 118, 226, 0.6)',
    },
    '&:disabled': {
      backgroundColor: 'rgba(151, 172, 232, 0.5)',
      borderColor: 'rgba(151, 172, 232, 0.8)',
    }
  },
  [theme.breakpoints.down('sm')]: { // for screens smaller than 600px
    fontSize: '16px',
  },
}))(Button);
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

function uploadDefaultRecipes({uid}) {
  const functions = getFunctions();
  const addDefaultRecipes = httpsCallable(functions, 'add_default_recipes');
  addDefaultRecipes({uid: uid}).catch(e => console.log(e))
}


export default function PageSignUp() {

  const navigate = useNavigate();

  const [email, setEmail] = useState('')
  const getEmail = (event) => {setEmail(event.target.value)};
  const [password, setPassword] = useState('')
  const getPassword = (event) => {setPassword(event.target.value)};
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const getPasswordConfirm = (event) => {setPasswordConfirm(event.target.value)};
  const [terms, setTerms] = useState(false)
  const getTerms = (event) => {
    if (event.target.checked) {
      setTerms(true)
    }
    else {
      setTerms(false)
    }
  };
  const [error, setError] = useState(null)

  let isInvalid = (
    email === '' ||
    password === '' ||
    password !== passwordConfirm ||
    !terms
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null)

    const analytics = getAnalytics();
    logEvent(analytics, "new_account");

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;

        sendEmailVerification(user)
          .then(() => {
            // Email sent successfully
          })
          .catch(error => {
            // An error happened while sending the email verification
          });

        // Create a user in the Firebase Firestore database        
        const db = getFirestore()
        setDoc(doc(db, 'users', user.uid), { email })
          .then(() => {
            // Document successfully written
          })
          .catch(error => {
            // An error happened while writing the document
          });

        uploadDefaultRecipes({ uid: user.uid });
        navigate(ROUTES.HOME)
      })
      .catch((error) => {
        setError(error)
      });
  }
  

  return (
    <div>
      <StyledHeader>Sign Up.</StyledHeader>
      <StyledTextField>
        <CssTextField
          label="Email Address"
          autoComplete='email'
          onChange={getEmail}
          variant="outlined"
          style={{width: '100%'}}
        />
      </StyledTextField>
      <StyledTextField>
        <CssTextField
          label="Password"
          autoComplete='password'
          type="password"
          onChange={getPassword}
          variant="outlined"
          style={{width: '100%'}}
        />
      </StyledTextField>
      <StyledTextField>
        <CssTextField
          label="Confirm Password"
          autoComplete='password'
          type="password"
          onChange={getPasswordConfirm}
          variant="outlined"
          style={{width: '100%'}}
        />
      </StyledTextField>
      <StyledCheckbox>
        <FormControlLabel control={<CheckboxTerms checked={terms} onChange={getTerms} />}/>
          <p>I agree to Cooking with Ingles' <Link to={{pathname: "/terms"}}>Terms of Use</Link></p>
      </StyledCheckbox>
      <StyledButton>
        <StyledButtonCSS
          disabled={isInvalid}
          variant="outlined"
          size="large"
          style={{width: '100%', height: '55px'}}
          onClick={onSubmit}
        >
          Sign Up
        </StyledButtonCSS>
      </StyledButton>
      <StyledTextField>
        {error && <p style={{margin: '-15px auto 50px'}}>{error.message}</p>}
      </StyledTextField>
    </div>
  )
}
