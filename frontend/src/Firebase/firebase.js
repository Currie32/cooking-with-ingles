import app from 'firebase/app';
import 'firebase/auth';

const config = {
  apiKey: "AIzaSyBhgTH-fI2GGlVC3W0N4uXLFMcCsYf-fTA",
  authDomain: "cooking-with-ingles.firebaseapp.com",
  projectId: "cooking-with-ingles",
  storageBucket: "cooking-with-ingles.appspot.com",
  messagingSenderId: "653853056354",
  appId: "1:653853056354:web:f4304d2f3f4508a71ca03b",
  measurementId: "G-690W0X1P56"
};

class Firebase {
  constructor() {
    app.initializeApp(config);

    require("firebase");

    this.auth = app.auth();
    this.db = app.database();
  }

  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () => this.auth.signOut();

  doPasswordReset = email => this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = password =>
    this.auth.currentUser.updatePassword(password);

  // *** User API ***
  user = uid => this.db.ref(`users/${uid}`);
  users = () => this.db.ref('users');

}
export default Firebase;
