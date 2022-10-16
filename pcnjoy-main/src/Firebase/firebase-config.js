// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA8LbQZMTK4-Sa8jBDmrrAP7lbva8ArWSU",
  authDomain: "pcn-joy.firebaseapp.com",
  projectId: "pcn-joy",
  storageBucket: "pcn-joy.appspot.com",
  messagingSenderId: "69317486634",
  appId: "1:69317486634:web:bdc2205d527b1c18133b53",
  measurementId: "G-P8ELCBKPDP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

