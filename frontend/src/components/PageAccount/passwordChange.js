import React, { Component } from 'react';
import styled from 'styled-components'
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import {withStyles} from '@material-ui/core/styles';

import { withFirebase } from '../Firebase';

const StyledForm = styled.div`
  margin: 25px auto;
  max-width: 1000px;
  @media (max-width: 599px) {
    width: 100%;
  }
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
const StyledButtonCSS = withStyles((theme) => ({
  fontSize: '18px',
  ['@media (max-width:600px)']: {fontSize: '16px'},
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
}))(Button);


const INITIAL_STATE = {
  password: '',
  passwordConfirm: '',
  error: null,
};

class PasswordChangeForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
    const { password } = this.state;

    this.props.firebase
      .doPasswordUpdate(password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChangePassword = event => {
    this.setState({ password: event.target.value });
  };
  onChangePasswordConfirm = event => {
    this.setState({ passwordConfirm: event.target.value });
  };

  render() {
    const { password, passwordConfirm, error } = this.state;

    let valid = password === passwordConfirm && password !== '';

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledForm>
            <h2 style={{marginBottom: '30px', textAlign: 'center'}}>Change Password</h2>
            <StyledTextField>
              <CssTextField
                label="New Password"
                autoComplete='password'
                type="password"
                onChange={this.onChangePassword}
                variant="outlined"
                style={{width: '100%'}}
              />
            </StyledTextField>
            <StyledTextField>
              <CssTextField
                label="Confirm New Password"
                autoComplete='password'
                type="password"
                onChange={this.onChangePasswordConfirm}
                variant="outlined"
                style={{width: '100%'}}
              />
            </StyledTextField>
            <StyledButton>
              <StyledButtonCSS
                disabled={!valid}
                variant="outlined"
                size="large"
                style={{
                  width: '100%',
                  height: '55px',
                }}
                onClick={this.onSubmit}
              >
                Change Password
              </StyledButtonCSS>
            </StyledButton>
            <StyledTextField>
              {error && <p>{error.message}</p>}
            </StyledTextField>
          </StyledForm>
        </Grid>
      </Grid>
    );
  }
}

export default withFirebase(PasswordChangeForm);
