import React from 'react';
import firebase from 'firebase';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,

} from 'react-router-dom';
import styled from 'styled-components';

import Navigation from './components/Navigation';
import Footer from './components/Footer';

import PageAccount from './components/PageAccount';
import PageHome from './components/PageHome';
import PageLogIn from './components/PageLogIn';
import PageSignUp from './components/PageSignUp';
import PageGroceryList from './components/PageGroceryList';
import PageTermsOfUse from './components/Footer/termsOfUse';


import * as ROUTES from './constants/routes';
import { withAuthentication } from './components/Session';
import './App.css'

function App() {

  const [uid, setUid] = React.useState(false);
  const [verified, setVerified] = React.useState(false)
  React.useEffect(() => {
    const authListener = firebase.auth().onAuthStateChanged(
      async function (user) {
        if(user) {await setUid(user.uid)}
        else {await setUid('default')}
        setVerified(user?.emailVerified)
      }
    );
    return authListener;
  },[]);

  return (
    <Router>
      <div>
        <Navigation />
        <Switch>
          <Route exact path={ROUTES.ACCOUNT} component={PageAccount}/>
          <Route exact path={ROUTES.HOME} render={ () => <PageHome uid={uid} />}/>
          <Route exact path={ROUTES.LOG_IN} component={PageLogIn} />
          <Route exact path={ROUTES.SIGN_UP} component={PageSignUp} />
          <Route exact path={ROUTES.TERMS_OF_USE} component={PageTermsOfUse} />
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default withAuthentication(App);
