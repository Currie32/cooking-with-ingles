import React from 'react';
import styled from "styled-components";
import { withFirebase } from '../Firebase';


const StyledDiv = styled.div`
  font-size: 18px;
  font-family: 'Lato';
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  width: 70px;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.9);
`;


const ButtonSignOut = ({ firebase }) => (
  <StyledDiv onClick={firebase.doSignOut}>
    Sign Out
  </StyledDiv>
);
export default withFirebase(ButtonSignOut);
