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
import PageCookbooks from './components/PageCookbooks';
import PageHome from './components/PageHome';
import PageLogIn from './components/PageLogIn';
import PageSaved from './components/PageSaved';
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

  // Warm up get_recipes API
  const [testing, setTesting] = React.useState(false);
  React.useEffect(() => {
    if (!testing) {
      async function fetchData() {
        const getRecipes = firebase.functions().httpsCallable('get_recipes');
        const response = await getRecipes({ingredients: 'pasta', userCookbooks: []}).catch()
      }
      fetchData()
    }
  }, [])

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

  const [cookbookFromSearch, setCookbookFromSearch] = React.useState(false)
  const getCookbookFromSearch = (value) => {
    setCookbookFromSearch(value);
    window.localStorage.setItem('cookbookCookbooks', JSON.stringify(value))
  }

  React.useEffect(() => {
    const storedUserCookbooks = window.localStorage.getItem('userCookbooks');
    if ( storedUserCookbooks !== null ) {setUserCookbooks(JSON.parse(storedUserCookbooks))};
  }, []);

  return (
    <Router>
      <div>
        <Navigation />
        <Switch>
          <Route exact path={ROUTES.ACCOUNT} render={ () => <PageAccount uid={uid} userCookbooks={userCookbooks} getUserCookbooks={getUserCookbooks} />}/>
          <Route exact path={ROUTES.HOME} render={ () => <PageHome uid={uid} userCookbooks={userCookbooks} getCookbookFromSearch={getCookbookFromSearch} />}/>
          <Route exact path={ROUTES.SAVED} render={ () => <PageSaved uid={uid} />}/>
          <Route exact path={ROUTES.COOKBOOKS} render={ () => <PageCookbooks cookbookFromSearch={cookbookFromSearch} />}/>
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
