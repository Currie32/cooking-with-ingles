import React from 'react';
import { Link } from 'react-router-dom';
import styled from "styled-components";
import MenuIcon from '@mui/icons-material/Menu';

import * as ROUTES from '../../constants/routes';


const Navbar = styled.div`
  background-color: rgba(222, 185, 22, 1);
  padding: 0px 0px 20px;
  left: 0;
  width: 100%;
  position: fixed;
  z-index: 3;
  height: 50px;
`;
const NavbarSmall = styled.div`
  background-color: rgba(222, 185, 22, 1);
  padding: 0px 0px 20px;
  left: 0;
  width: 100%;
  position: fixed;
  z-index: 3;
  height: 50px;
`;
const StyledMenuIcon = styled.div`
  padding: 25px 0px 0px 20px;
`;
const StyledHomeLink = styled.div`
  padding-top: 25px;
  margin: -52px auto;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const ListOrdered = styled.div`
  padding-top: 70px;
  left: 0;
  position: fixed;
  height: 150px;
  width: 100%;
  z-index: 2;
`;
const List = styled.ul`
  overflow-x: auto;
  display: flex;
  justify-content: left;
  align-items: left;
  padding-bottom: 20px;
`;
const ListItemVertical = styled.div`
  font-weight: 300;
  background-color: rgba(0, 44, 25, 1);
  padding: 0px 15px 15px;
  width: 100%;
  z-index: 3;
`;
const ListItem = styled.li`
  display: inline-flex;
    margin: 0px 40px 0px 0px;
  font-weight: 300;
  border-bottom: 2px solid rgba(62, 219, 104, 0);
  &:hover{
    border-bottom: 1px solid rgba(0, 0, 0, 0.8);
  }
  @media (max-width: 1230px) {
    margin: 0px 40px 0px 0px;
  }
`;
const StyledLink = styled(Link)`
  font-size: 20px;
  color: rgb(0, 0, 0);
  text-decoration: none;
  white-space: nowrap;
  margin-top: 6px;
`;
const HomeLink = styled(Link)`
  font-size: 22px;
  color: rgb(0, 0, 0);
  text-decoration: none;
  margin-top: 5px;
`;


export default function Navigation() {

  const [menuDisplay, setMenuDisplay] = React.useState(false)

  return (
    <div>
      {window.innerWidth < 750 && <div>
        <NavbarSmall>
          <StyledMenuIcon><MenuIcon style={{color: '#fafafa'}} onClick={() => setMenuDisplay(!menuDisplay)} /></StyledMenuIcon>
          <StyledHomeLink><HomeLink to={ROUTES.HOME}>Cooking with Ingles</HomeLink></StyledHomeLink>
        </NavbarSmall>
        {menuDisplay && <ListOrdered>
          <ListItemVertical><StyledLink to={ROUTES.HOME} onClick={() => setMenuDisplay(false)}>Recipes</StyledLink></ListItemVertical>
          <ListItemVertical><StyledLink to={ROUTES.GROCERY_LIST} onClick={() => setMenuDisplay(false)}>Grocery List</StyledLink></ListItemVertical>
        </ListOrdered>}
      </div>}
      {window.innerWidth >= 750 && <Navbar>
        <List>
          <ListItem><HomeLink to={ROUTES.HOME}>Cooking with Ingles</HomeLink></ListItem>
          <ListItem></ListItem>
          <ListItem><StyledLink to={ROUTES.HOME}>Recipes</StyledLink></ListItem>
          <ListItem><StyledLink to={ROUTES.GROCERY_LIST}>Grocery List</StyledLink></ListItem>
        </List>
      </Navbar>}
    </div>
  )
}
