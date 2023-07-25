import { getFunctions, httpsCallable } from "firebase/functions";
import Grid from '@material-ui/core/Grid';
import { useContext, useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from 'react-router-dom';
import styled from 'styled-components';

import './App.css'
import Footer from './components/Footer';
import PageTermsOfUse from './components/Footer/termsOfUse';
import Navigation from './components/Navigation';
import PageAccount from './components/PageAccount';
import PageCookbooks from './components/PageCookbooks';
import PageCreate from './components/PageCreate';
import PageHome from './components/PageHome';
import PageLogIn from './components/PageLogIn';
import PagePasswordForgot from './components/PagePasswordForgot';
import PageSaved from './components/PageSaved';
import PageSignUp from './components/PageSignUp';
import * as ROUTES from './constants/routes';
import { AuthContext } from "./contexts/AuthContext";


const StyledPage = styled.div`
  margin-top: 100px;
  min-height: 435px;  
  padding: 0px 25px;
`;


export default function App() {

  const functions = getFunctions();

  const { user } = useContext(AuthContext);
  const [uid, setUid] = useState(false);
  const [verified, setVerified] = useState(false)
  useEffect(() => {
    if (user) {
      setUid(user.uid);
    }
    else {
      setUid('default');
    }
    setVerified(user?.emailVerified);
  }, [user]);

  // Warm up get_recipes API
  const [testing, setTesting] = useState(false);
  useEffect(() => {
    if (!testing) {
      try {
        const getRecipes = httpsCallable(functions, 'get_recipes');
        getRecipes({ ingredients: 'pasta', userCookbooks: [] });
      }
      catch {}
    }
  }, [])

  const [userCookbooks, setUserCookbooks] = useState([])
  useEffect(() => {
    if (uid && uid !== 'default') {
      async function fetchData() {
        const readUserCookbooks = httpsCallable(functions, 'read_user_cookbooks');
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

  const [cookbookFromSearch, setCookbookFromSearch] = useState(false)
  const getCookbookFromSearch = (value) => {
    setCookbookFromSearch(value);
    window.localStorage.setItem('cookbookCookbooks', JSON.stringify(value))
  }

  useEffect(() => {
    const storedUserCookbooks = window.localStorage.getItem('userCookbooks');
    if ( storedUserCookbooks !== null ) {setUserCookbooks(JSON.parse(storedUserCookbooks))};
  }, []);

  return (
    <Router>
      <Navigation />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPage>
            <Routes>
              <Route path={ROUTES.ACCOUNT} element={<PageAccount uid={uid} userCookbooks={userCookbooks} getUserCookbooks={getUserCookbooks} />}/>
              <Route path={ROUTES.HOME} element={<PageHome uid={uid} userCookbooks={userCookbooks} getCookbookFromSearch={getCookbookFromSearch} />}/>
              <Route path={ROUTES.SAVED} element={<PageSaved uid={uid} />}/>
              <Route path={ROUTES.CREATE} element={<PageCreate />} />
              <Route path={ROUTES.COOKBOOKS} element={<PageCookbooks cookbookFromSearch={cookbookFromSearch} />}/>
              <Route path={ROUTES.LOG_IN} element={<PageLogIn />} />
              <Route path={ROUTES.PASSWORD_FORGET} element={<PagePasswordForgot />} />
              <Route path={ROUTES.SIGN_UP} element={<PageSignUp />} />
              <Route path={ROUTES.TERMS_OF_USE} element={<PageTermsOfUse />} />
            </Routes>
          </StyledPage>
        </Grid>
      </Grid>
      <Footer />
    </Router>
  );
}
