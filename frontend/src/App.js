import React from 'react';
import firebase from 'firebase';
import {
    BrowserRouter as Router,
    Switch,
    Route,

} from 'react-router-dom';

import Navigation from './components/Navigation';
import Footer from './components/Footer';

import PageAccount from './components/PageAccount';
import PageHome from './components/PageHome';
import PageLogIn from './components/PageLogIn';
import PageSearch from './components/PageSearch';
import PageSignUp from './components/PageSignUp';
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

  const [userCookbooks, setUserCookbooks] = React.useState([])
  React.useEffect(() => {
    if (uid && uid !== 'default') {
      async function fetchData() {
        const readUserCookbooks = firebase.functions().httpsCallable('read_user_cookbooks');
        const response = await readUserCookbooks({uid: uid}).then(response => response.data).catch()
        setUserCookbooks(response)
        window.localStorage.setItem('userCookbooks', JSON.stringify(response))
      }
      fetchData()
    }
  }, [uid])
  const getUserCookbooks = (selectedCookbooks) => {
    if (selectedCookbooks === null) {setUserCookbooks([])}
    else {
      selectedCookbooks = selectedCookbooks.map(i => i.value)
      setUserCookbooks(selectedCookbooks);
    }
  }

  React.useEffect(() => {
    const storedUserCookbooks = window.localStorage.getItem('userCookbooks');
    if ( storedUserCookbooks !== null ) {
      setUserCookbooks(JSON.parse(storedUserCookbooks));
    };
  }, []);

  return (
    <Router>
      <div>
        <Navigation />
        <Switch>
          <Route exact path={ROUTES.ACCOUNT} render={ () => <PageAccount uid={uid} userCookbooks={userCookbooks} getUserCookbooks={getUserCookbooks} />}/>
          <Route exact path={ROUTES.HOME} render={ () => <PageHome uid={uid} />}/>
          <Route exact path={ROUTES.SEARCH} render={ () => <PageSearch uid={uid} userCookbooks={userCookbooks} />}/>
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
