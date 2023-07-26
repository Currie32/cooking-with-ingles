import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBhgTH-fI2GGlVC3W0N4uXLFMcCsYf-fTA",
  authDomain: "cooking-with-ingles.firebaseapp.com",
  projectId: "cooking-with-ingles",
  storageBucket: "cooking-with-ingles.appspot.com",
  messagingSenderId: "653853056354",
  appId: "1:653853056354:web:f4304d2f3f4508a71ca03b",
  measurementId: "G-690W0X1P56"
};

// Initialize Firebase
initializeApp(firebaseConfig);

// Initialize Firebase Auth, Firestore
const auth = getAuth();
const db = getFirestore();

export { auth, db };
