import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import * as ROUTES from '../../constants/routes';


const StyledHeader = styled.h1`
  fontSize: 36px;
  text-align: center;
  margin: 130px auto 30px;
`;
const StyledTextField = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 15px auto 0px;
  max-width: 600px;
`;
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
  [theme.breakpoints.down('sm')]: { // For screens smaller than 600px
    fontSize: '16px',
  },
}))(Button);
const StyledTextError = styled.p`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: -25px auto 50px;
  max-width: 600px;
`;


export default function PagePasswordForgot() {

  const navigate = useNavigate();

  const [email, setEmail] = useState('')
  const getEmail = (event) => {setEmail(event.target.value)};
  const [error, setError] = useState(null)

  const isInvalid = email === '';

  const onSubmit = async (e) => {
    e.preventDefault();
  
    const auth = getAuth();
    sendPasswordResetEmail(auth, email)
      .then(() => {
        navigate(ROUTES.LOG_IN)
      })
      .catch((error) => {
        setError(error)
      });
  }

  return (
    <div>
      <StyledHeader>Reset Password.</StyledHeader>
      <StyledTextField>
        <TextField
          label="Email Address"
          autoComplete='email'
          onChange={getEmail}
          variant="outlined"
          style={{width: '100%'}}
        />
      </StyledTextField>
      <StyledButton>
        <StyledButtonCSS
          disabled={isInvalid}
          variant="outlined"
          size="large"
          style={{width: '100%', height: '55px'}}
          onClick={onSubmit}
        >
          Reset My Password
        </StyledButtonCSS>
      </StyledButton>
      {error &&
        <StyledTextError>
          <p>{error.message}</p>
        </StyledTextError>
      }
    </div>
  )
};
