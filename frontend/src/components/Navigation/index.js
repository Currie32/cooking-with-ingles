import React from 'react';
import { Link } from 'react-router-dom';
import styled from "styled-components";
import MenuIcon from '@mui/icons-material/Menu';

import ButtonSignOut from './buttonSignOut';
import * as ROUTES from '../../constants/routes';
import { AuthUserContext } from '../Session';

import img from './pattern.jpeg';


const Navbar = styled.div`
  background-image: url(${img});
  background-repeat: repeat;
  background-size: 50px;
  padding: 0px 0px 20px;
  left: 0;
  width: 100%;
  position: fixed;
  z-index: 3;
  height: 50px;
`;
const NavbarSmall = styled.div`
  background-image: url(${img});
  background-repeat: repeat;
  background-size: 50px;
  padding: 0px 0px 20px;
  left: 0;
  width: 100%;
  position: fixed;
  z-index: 3;
  height: 50px;
`;
const StyledMenuIcon = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  margin: 20px 0px 0px 20px;
  padding: 4px 5px 0px;
  width: fit-content;
`;
const StyledHomeLink = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  padding: 2px 20px 5px;
  width: fit-content;
  margin: -35px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  @media (max-width: 1050px) {
    margin: -35px auto;
    padding: 0px 20px 6px;
  };
`;
const ListOrdered = styled.div`
  padding-top: 70px;
  left: 0;
  position: fixed;
  width: 100%;
  z-index: 2;
`;
const List = styled.ul`
  background-color: rgba(0, 0, 0, 0.8);
  overflow-x: auto;
  display: flex;
  justify-content: left;
  align-items: left;
  width: fit-content;
  padding-bottom: 5px;
`;
const ListItemVertical = styled.div`
  background-image: url(${img});
  background-repeat: repeat;
  background-size: 50px;

  padding: 0px 15px 0px;
  width: 100%;
  z-index: 3;
`;
const StyledListItemVerticalShadow = styled.div`
  background-color: rgba(0, 0, 0, 0.8);
  width: 70px;
  padding: 2px 25px 5px;
`;
const ListItem = styled.li`
  color: rgba(255, 255, 255, 0.9);
  display: inline-flex;
  text-align: center;
  margin: 0px 40px 0px 0px;

  &:hover{
    border-bottom: 1px solid rgba(255, 255, 255, 0.8);
  }
`;
const StyledLink = styled(Link)`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  white-space: nowrap;
  margin-top: 6px;
`;
const HomeLink = styled(Link)`
  font-size: 22px;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  margin-top: 5px;
  text-align: center;
`;


export default function Navigation() {

  return (
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? <NavigationAuth /> : <NavigationNonAuth />
      }
    </AuthUserContext.Consumer>
  )
}


function removeElement() {
    var elem = document.getElementById("chartjs-tooltip");
    if (elem) {
      return elem.parentNode.removeChild(elem);
    }
}


function NavigationAuth() {

  const [menuDisplay, setMenuDisplay] = React.useState(false)

  return (
    <div onMouseEnter={() => removeElement()}>
    {window.innerWidth < 1050 && <div>
      <NavbarSmall>
        <StyledMenuIcon><MenuIcon style={{color: 'rgba(255, 255, 255, 1)'}} onClick={() => setMenuDisplay(!menuDisplay)} /></StyledMenuIcon>
        <StyledHomeLink><HomeLink to={ROUTES.HOME}>Cooking with Ingles</HomeLink></StyledHomeLink>
      </NavbarSmall>
      {menuDisplay && <ListOrdered>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.HOME} onClick={() => setMenuDisplay(false)}>Home</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.SAVED} onClick={() => setMenuDisplay(false)}>Saved</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.ACCOUNT} onClick={() => setMenuDisplay(false)}>Account</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical style={{paddingBottom: '20px'}}><StyledListItemVerticalShadow><ButtonSignOut onClick={() => setMenuDisplay(false)}/></StyledListItemVerticalShadow></ListItemVertical>
      </ListOrdered>}
    </div>}
    {window.innerWidth >= 1050 && <Navbar>
      <List>
        <ListItem><HomeLink to={ROUTES.HOME}>Cooking with Ingles</HomeLink></ListItem>
        <ListItem></ListItem>
        <ListItem><StyledLink to={ROUTES.SAVED}>Saved</StyledLink></ListItem>
        <ListItem><StyledLink to={ROUTES.ACCOUNT}>Account</StyledLink></ListItem>
        <ListItem><ButtonSignOut /></ListItem>
      </List>
    </Navbar>}
    </div>
  )
}

function NavigationNonAuth() {

  const [menuDisplay, setMenuDisplay] = React.useState(false)

  return (
    <div onMouseEnter={() => removeElement()}>
    {window.innerWidth < 1050 && <div>
      <NavbarSmall>
        <StyledMenuIcon><MenuIcon style={{color: 'rgba(255, 255, 255, 1)'}} onClick={() => setMenuDisplay(!menuDisplay)} /></StyledMenuIcon>
        <StyledHomeLink><HomeLink to={ROUTES.HOME}>Cooking with Ingles</HomeLink></StyledHomeLink>
      </NavbarSmall>
      {menuDisplay && <ListOrdered>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.HOME} onClick={() => setMenuDisplay(false)}>Home</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.SAVED} onClick={() => setMenuDisplay(false)}>Saved</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.LOG_IN} onClick={() => setMenuDisplay(false)}>Log In</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
        <ListItemVertical><StyledListItemVerticalShadow><StyledLink to={ROUTES.SIGN_UP} onClick={() => setMenuDisplay(false)}>Sign Up</StyledLink></StyledListItemVerticalShadow></ListItemVertical>
      </ListOrdered>}
    </div>}
    {window.innerWidth >= 1050 && <Navbar>
      <List>
        <ListItem><HomeLink to={ROUTES.HOME}>Cooking with Ingles</HomeLink></ListItem>
        <ListItem></ListItem>
        <ListItem><StyledLink to={ROUTES.SAVED}>Saved</StyledLink></ListItem>
        <ListItem><StyledLink to={ROUTES.LOG_IN}>Log In</StyledLink></ListItem>
        <ListItem><StyledLink to={ROUTES.SIGN_UP}>Sign Up</StyledLink></ListItem>
      </List>
    </Navbar>}
    </div>
  )
}
