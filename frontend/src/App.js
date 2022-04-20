import React from 'react';
import firebase from 'firebase';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Redirect,

} from 'react-router-dom';
import styled from 'styled-components';

import Navigation from './components/Navigation';
import PageHome from './components/PageHome';
import PageGroceryList from './components/PageGroceryList';


import * as ROUTES from './constants/routes';
//import { withAuthentication } from '../Session';
import './App.css'

function App() {

  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route path={ROUTES.HOME} element={<PageHome />}/>
          <Route path={ROUTES.GROCERY_LIST} element={<PageGroceryList/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
