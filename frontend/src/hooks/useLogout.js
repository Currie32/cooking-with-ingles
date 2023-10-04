import { signOut } from "firebase/auth";
import { useContext } from "react";

import { AuthContext } from "../contexts/AuthContext";
import { auth } from "../Firebase/config";


export const useLogout = () => {

  const { dispatch } = useContext(AuthContext);

  const logout = async () => {
    try {
      await signOut(auth);
      dispatch({ type: "LOGOUT" });
    } catch (error) {
    }
  };

  return { logout };
};