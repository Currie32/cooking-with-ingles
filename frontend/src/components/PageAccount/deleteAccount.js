import { getAnalytics, logEvent } from 'firebase/analytics';
import { deleteUser, getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { getFunctions, httpsCallable } from 'firebase/functions';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {withStyles} from '@material-ui/core/styles';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import * as ROUTES from '../../constants/routes';


const StyledButtonCSS = withStyles((theme) => ({
  fontSize: '18px',
  root: {
    borderColor: 'rgba(79, 118, 226, 0.5)',
    backgroundColor: 'rgba(79, 118, 226, 0.1)',
    color: 'rgba(79, 118, 226, 1)',
    '&:hover': {
      backgroundColor: 'rgba(79, 118, 226, 0.2)',
      borderColor: 'rgba(79, 118, 226, 0.6)',
    },
    '&:disabled': {
      backgroundColor: 'rgba(151, 172, 232, 0.5)',
      borderColor: 'rgba(151, 172, 232, 0.8)',
    }
  },
  [theme.breakpoints.down('sm')]: { // for screens smaller than 600px
    fontSize: '16px',
  },
}))(Button);
const StyledCheckbox = styled.div`
  display: flex;
  justify-content: left;
  align-items: left;
  margin: 15px auto 0px;
`;
const CheckboxTerms = withStyles({
  root: {
    color: "rgba(0, 44, 25, 0.98)",
    '&$checked': {color: "rgba(0, 44, 25, 0.98)"},
  },
  checked: {},
})((props) => <Checkbox color="default" {...props} />);


function deleteUserDocumentsFunction({uid}) {
  const functions = getFunctions();
  const deleteUserDocuments = httpsCallable(functions, 'delete_user');
  deleteUserDocuments({uid: uid}).catch(e => console.log(e))
}


export default function DeleteAccount() {

  const navigate = useNavigate();

  const [confirmDelete, setConfirmDelete] = useState(false)
  const getConfirmDelete = (event) => {
    if (event.target.checked) {setConfirmDelete(true)}
    else {setConfirmDelete(false)}
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const analytics = getAnalytics();
    logEvent(analytics, "delete_account");

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      await deleteUser(user);

      const db = getFirestore();
      deleteUserDocumentsFunction({ uid: user.uid });
      navigate(ROUTES.HOME)
    }
    catch (error) {
      console.log(error)
      // An error ocurred
    }
  }
    
  return (
    <div>
      <h2 style={{marginBottom: '30px', textAlign: 'center'}}>Delete Account</h2>
      <StyledButtonCSS
        disabled={!confirmDelete}
        variant="outlined"
        size="large"
        style={{
          width: '100%',
          height: '55px',
        }}
        onClick={onSubmit}
      >
        Delete my Account
      </StyledButtonCSS>
      <StyledCheckbox>
        <FormControlLabel control={<CheckboxTerms checked={confirmDelete} onChange={getConfirmDelete} />}/>
          <p>I would like to delete my account</p>
      </StyledCheckbox>
    </div>
  )
};