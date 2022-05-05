import React, { Component } from 'react';
import firebase from 'firebase';
import styled from 'styled-components'
import { withRouter } from 'react-router-dom';
import { compose } from 'react-recompose';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Link } from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';


const StyledPage = styled.div`
  padding: 0px 25px;
`;
const StyledTextFields = styled.div`
  padding-top: 100px;
`;
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
  ['@media (max-width:600px)']: {fontSize: '16px'},
  root: {
    backgroundColor: 'rgba(222, 185, 22, 1)',
    color: 'rgba(0, 0, 0, 1)',
    '&:hover': {
      backgroundColor: 'rgba(222, 185, 22, 0.8)',
    },
    '&:disabled': {
      backgroundColor: 'rgba(222, 185, 22, 0.3)',
      color: 'rgba(0, 0, 0, 0.3)'
    }
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
  const addDefaultRecipes = firebase.functions().httpsCallable('add_default_recipes');
  addDefaultRecipes({uid: uid}).catch(e => console.log(e))
}


const INITIAL_STATE = {
  email: '',
  password: '',
  passwordConfirm: '',
  error: null,
  terms: false
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE}
  }

  onSubmit = event => {

    firebase.analytics().logEvent("new_account")

    const { email, password } = this.state;

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, password)
      .then(authUser => {

        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
        var user = firebase.auth().currentUser;
        uploadDefaultRecipes({uid: user.uid})
        user.sendEmailVerification().then(function() {
          // Email sent.
        }).catch(function(error) {
          // An error happened.
        });

        // Create a user in the Firebase database
        return this.props.firebase
          .user(authUser.user.uid)
          .set({email});
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  }

  onChangeEmail = event => {
    this.setState({ email: event.target.value });
  };
  onChangePassword = event => {
    this.setState({ password: event.target.value });
  };
  onChangePasswordConfirm = event => {
    this.setState({ passwordConfirm: event.target.value });
  };
  onChangeTerms = event => {
    const { terms } = this.state;
    if (terms) {this.setState({terms: false})}
    else {this.setState({terms: true})}
  };

  render() {
    const {
      email,
      password,
      passwordConfirm,
      error,
      terms,
    } = this.state;

    const isInvalid =
      password !== passwordConfirm ||
      password === '' ||
      email === '' ||
      !terms;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <form>
            <StyledTextFields>
              <StyledHeader>Sign Up.</StyledHeader>
              <StyledTextField>
                <CssTextField
                  label="Email Address"
                  autoComplete='email'
                  onChange={this.onChangeEmail}
                  variant="outlined"
                  style={{width: '100%'}}
                />
              </StyledTextField>
              <StyledTextField>
                <CssTextField
                  label="Password"
                  autoComplete='password'
                  type="password"
                  onChange={this.onChangePassword}
                  variant="outlined"
                  style={{width: '100%'}}
                />
              </StyledTextField>
              <StyledTextField>
                <CssTextField
                  label="Confirm Password"
                  autoComplete='password'
                  type="password"
                  onChange={this.onChangePasswordConfirm}
                  variant="outlined"
                  style={{width: '100%'}}
                />
              </StyledTextField>
              <StyledCheckbox>
                <FormControlLabel
                  control={<CheckboxTerms checked={terms} onChange={this.onChangeTerms} />}
                />
                <p>I agree Cooking with Ingles' <Link to={{pathname: "/terms"}}>Terms of Use</Link></p>
              </StyledCheckbox>
            </StyledTextFields>
            <StyledButton>
              <StyledButtonCSS
                disabled={isInvalid}
                variant="outlined"
                size="large"
                style={{width: '100%', height: '55px'}}
                onClick={this.onSubmit}
              >
                Sign Up
              </StyledButtonCSS>
            </StyledButton>
            <StyledTextField>
              {error && <p style={{margin: '-15px auto 50px'}}>{error.message}</p>}
            </StyledTextField>
          </form>
        </Grid>
      </Grid>
    );
  }
}

const SignUpForm = compose(
  withRouter,
  withFirebase,
)(SignUpFormBase);

export default function PageSignUp() {
  return (
    <StyledPage>
      <SignUpForm />
    </StyledPage>
  )
}

export { SignUpForm };
