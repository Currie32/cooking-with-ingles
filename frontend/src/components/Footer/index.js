import React from 'react';
import { Link } from 'react-router-dom';
import styled from "styled-components";
import Grid from '@material-ui/core/Grid';
import firebase from 'firebase';
import * as ROUTES from '../../constants/routes';

import buyMeACoffee from './buyMeACoffee.png';


const FooterSection = styled.div`
  overflow: hidden;
  color: rgba(0, 0, 0, 0.8);
  font-size: 14px;
  bottom: 0;
  z-index: 3;
`;
const StyledList = styled.div`
  display: block;

`;
const List = styled.ul`
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 10px;
  @media (max-width: 683px) {
    display: block;
    justify-content: left;
    align-items: left;
  }
`;
const ListItem = styled.li`
  display: inline-block;
  padding: 3px 20px;
  border-right: 1px solid rgba(0, 0, 0, 0.1);
`;
const ListItemLast = styled.li`
  display: inline-block;
  padding: 3px 20px;
`;
const StyledLink = styled(Link)`
  text-decoration: none;
  :hover {text-decoration: underline}
  white-space: nowrap;
`;
const StyledBuyMeACoffee = styled.img`
  width: 150px;
`;

export default function Footer() {

  function removeElement() {
      var elem = document.getElementById("chartjs-tooltip");
      if (elem) {
        return elem.parentNode.removeChild(elem);
      }
  }

  return (
    <Grid container spacing={3} onMouseEnter={() => removeElement()}>
      <Grid item xs={12}>
        <FooterSection>
          <hr style={{
            border: '0.5px solid rgba(0, 0, 0, 0.1)',
            margin: '15px 3.5% 0px 2%'
          }}/>
          <StyledList>
            <List>
              <ListItem>Cooking with Ingles. All rights reserved.</ListItem>
              <ListItem><StyledLink to={ROUTES.TERMS_OF_USE}>Terms of Use</StyledLink></ListItem>
              <ListItem>
                <a target="_blank" href="https://github.com/Currie32/cooking-with-ingles" onClick={() => {firebase.analytics().logEvent('Github repo')}}>
                  We're open source!
                </a>
              </ListItem>
              <ListItemLast>
                <a target="_blank" rel="noreferrer" href="https://www.buymeacoffee.com/Currie32" onClick={() => {firebase.analytics().logEvent('Buy Me a Coffee, Maybe?')}}>
                  <StyledBuyMeACoffee src={buyMeACoffee} />
                </a>
              </ListItemLast>
            </List>
          </StyledList>
        </FooterSection>
      </Grid>
    </Grid>
  )
};
