import React, { Component } from 'react';
import styled from 'styled-components'
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'react-recompose';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import {withStyles} from '@material-ui/core/styles';

import { withFirebase } from '../Firebase';
import * as ROUTES from '../../constants/routes';


const StyledPage = styled.div`
  padding: 0px 25px;
  min-height: 590px;
`;
const StyledTextFields = styled.div`
  padding-top: 110px;
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
const StyledButton = styled.div`
  margin: 15px auto 30px;
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
const StyledTextPasswordForget = styled.p`
  color: black;
  text-decoration: none;
  text-align: center;
`;
const StyledTextSignUp = styled.p`
  color: black;
  text-decoration: none;
  text-align: center;
  margin-bottom: 50px;
`;
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


const INITIAL_STATE = {
  email: '',
  password: '',
  error: null,
};

function PasswordForgetLink() {
  return (
    <StyledTextPasswordForget>
      <Link to={ROUTES.PASSWORD_FORGET} style={{color: '#0000EE'}}>Forgot Password?</Link>
    </StyledTextPasswordForget>
  )
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }
  onSubmit = event => {
    const { email, password } = this.state;

    this.props.firebase
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.HOME);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChangeEmail = event => {
    this.setState({ email: event.target.value });
  };
  onChangePassword = event => {
    this.setState({ password: event.target.value });
  };

  render() {
    const { email, password, error } = this.state;

    const isInvalid = email === '' || password === '';

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <form>
            <StyledTextFields>
              <StyledHeader>Log In.</StyledHeader>
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
                  label='Password'
                  type="password"
                  autoComplete='password'
                  onChange={this.onChangePassword}
                  variant="outlined"
                  style={{width: '100%'}}
                />
              </StyledTextField>
            </StyledTextFields>
            <StyledButton>
              <StyledButtonCSS
                disabled={isInvalid}
                variant="outlined"
                size="large"
                style={{width: '100%', height: '55px'}}
                onClick={this.onSubmit}
              >
                Log In
              </StyledButtonCSS>
            </StyledButton>
            <StyledTextField>
              {error && <p>{error.message}</p>}
            </StyledTextField>
          </form>
        </Grid>
      </Grid>
    );
  }
}

const SignInForm = compose(
  withRouter,
  withFirebase,
)(SignInFormBase);


export default function PageLogIn() {
  return (
    <StyledPage>
      <SignInForm />
      <PasswordForgetLink />
    </StyledPage>
  )
};

export { SignInForm };
