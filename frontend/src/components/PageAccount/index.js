import React from 'react';
import firebase from 'firebase';
import styled from 'styled-components'
import Grid from '@material-ui/core/Grid';
import CreatableSelect from "react-select";
import Button from '@mui/material/Button';
import {withStyles} from '@material-ui/core/styles';

import { AuthUserContext } from '../Session';
import PasswordChangeForm from './passwordChange';
import cookbooks from '../../constants/cookbooks.json';


const StyledPage = styled.div`
  min-height: 580px;
  margin: 100px 20px 0px;
`;
const StyledMenu = styled.div`
  width: 600px;
  margin: 0px auto 20px;
`;
const menuStyles = {
  control: (styles, state) => ({
    ...styles,
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
      fontSize: "15px"
    }
  }
}
const StyledButtonSaveCookbooks = withStyles((theme) => ({
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
const StyledButton = styled.div`
  margin: 15px auto 10px;
  max-width: 600px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const StyledRequest = styled.p`
  margin: 15px auto 15px;
  width: fit-content;
  font-style: italic;
`;


function PageAccount({uid, userCookbooks, getUserCookbooks}) {

  const [accountOption, setAccountOption] = React.useState(0)
  const getAccountOption = (event, option) => {setAccountOption(option)}

  let urlParams = new URLSearchParams(window.location.search);

  const [saveCookbooks, setSaveCookbooks] = React.useState(false)
  const [loadingSaveCookbooks, setLoadingSaveCookbooks] = React.useState(false)
  const handleSaveCookbooks = () => {
    setSaveCookbooks(true);
    setLoadingSaveCookbooks(true)
  }
  React.useEffect(() => {
    async function fetchData() {
      if (saveCookbooks && uid !== "default" && false) {
        const saveUserCookbooks = firebase.functions().httpsCallable('save_user_cookbooks');
        await saveUserCookbooks({cookbooks: cookbooks, uid: uid}).then(response => {
          loadingSaveCookbooks(false)
          setSaveCookbooks(false)
        })
      }
    }
    fetchData()
  }, [saveCookbooks])

  const saveUserCookbooks = firebase.functions().httpsCallable('save_user_cookbooks');
  const sendUserCookbooks = () => {
    saveUserCookbooks({
        cookbooks: userCookbooks,
        uid: uid
      })
      .then(response => {})
      .catch(error => {})
  }

  return (
    <AuthUserContext.Consumer>
      {authUser => (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPage>
              <StyledMenu>
                <h2 style={{marginBottom: '30px', textAlign: 'center'}}>My cookbooks</h2>
                <CreatableSelect
                  isMulti
                  options={cookbooks}
                  onChange={getUserCookbooks}
                  value={userCookbooks?.length > 0 ? userCookbooks.map(v => {return ({label: v, value: v})}) : []}
                  placeholder={'Choose cookbooks that you own'}
                  styles={menuStyles}
                />
              </StyledMenu>
              <StyledButton>
                <StyledButtonSaveCookbooks
                  variant="outlined" onClick={sendUserCookbooks} size="large"
                  style={{width: '100%', height: '55px'}}
                >
                  Save cookbooks
                </StyledButtonSaveCookbooks>
              </StyledButton>
              <StyledRequest>
                Can't find one of your cookbooks? Request it to be added by <a target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSfPveAlQDH0RIx0qWWmibA2nKxq7Rl7wIFn6j_Mysba1iZJlQ/viewform">clicking here.</a>
              </StyledRequest>
              <PasswordChangeForm />
            </StyledPage>
          </Grid>
        </Grid>
      )}
    </AuthUserContext.Consumer>
  )
};

const condition = authUser => !!authUser;

export default PageAccount;
