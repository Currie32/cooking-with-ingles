import React from 'react';
import firebase from 'firebase';
import styled from 'styled-components'
import Grid from '@material-ui/core/Grid';

import { AuthUserContext, withAuthorization } from '../Session';
import PasswordChangeForm from './passwordChange';


const StyledPage = styled.div`
  min-height: 580px;
  margin: 100px 20px 0px;
`;


function PageAccount({uid}) {

  const [accountOption, setAccountOption] = React.useState(0)
  const getAccountOption = (event, option) => {setAccountOption(option)}

  let urlParams = new URLSearchParams(window.location.search);
  let sessionId = urlParams.get("session_id")
  const [getUpdate, setGetUpdate] = React.useState(true)

  return (
    <AuthUserContext.Consumer>
      {authUser => (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledPage>
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
