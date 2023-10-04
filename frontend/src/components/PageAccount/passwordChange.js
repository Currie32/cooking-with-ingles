import { getAuth, updatePassword } from 'firebase/auth';
import Button from '@material-ui/core/Button';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useState } from 'react';
import styled from 'styled-components'


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


export default function PasswordChangeForm() {

  const [password, setPassword] = useState('')
  const getPassword = (event) => {setPassword(event.target.value)};
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const getPasswordConfirm = (event) => {setPasswordConfirm(event.target.value)};
  const [error, setError] = useState(null)
  const [success, setSucess] = useState(false)

  let valid = password === passwordConfirm && password !== '';

  const onSubmit = async (e) => {
    e.preventDefault();
  
    const auth = getAuth();
    const user = auth.currentUser;
    
    updatePassword(user, password).then(() => {
      // Update successful.
      setPassword('')
      setPasswordConfirm('')
      setSucess(true)
    }).catch((error) => {
      setError(error)
    });
  }

  return (
    <div>
      <h2 style={{marginBottom: '30px', textAlign: 'center'}}>Change Password</h2>
      <StyledTextField>
        <CssTextField
          label="New Password"
          autoComplete='password'
          type="password"
          onChange={getPassword}
          variant="outlined"
          style={{width: '100%', zIndex: '0'}}
        />
      </StyledTextField>
      <StyledTextField>
        <CssTextField
          label="Confirm New Password"
          autoComplete='password'
          type="password"
          onChange={getPasswordConfirm}
          variant="outlined"
          style={{width: '100%', zIndex: '0'}}
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
          onClick={onSubmit}
        >
          Change Password
        </StyledButtonCSS>
      </StyledButton>
      <StyledTextField>
        {error && <p>{error.message}</p>}
        {success && <p>Password successfully updated.</p>}
      </StyledTextField>
    </div>
  );
}
