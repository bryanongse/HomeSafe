import React, { useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { auth, db } from "../Firebase/firebase-config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute } from "@fortawesome/free-solid-svg-icons";

import { Navigate } from "react-router-dom";
import classes from "./LoginPage.module.css";
import "@fontsource/montserrat";

function LoginPage() {
  const handleSignIn = () => {
    const google_provider = new GoogleAuthProvider();
    signInWithPopup(auth, google_provider)
      .then((re) => {
        console.log(re);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const [userSignIn, setUserSignIn] = useState(false);
  auth.onAuthStateChanged((user) => {
    if (user) {
      // check if user exists, if not add to users collection
      const usersRef = doc(db, "users", user.uid);
      getDoc(usersRef).then((docSnapshot) => {
        if (!docSnapshot.exists()) {
          setDoc(usersRef, {
            name: user.displayName,
            email: user.email,
            uid: user.uid,
          });
        }
      });
      return setUserSignIn(true);
    } else {
      setUserSignIn(false);
    }
  });

  if (userSignIn) {
    return <Navigate to="/main" />;
  } else {
    return (
      <div className={classes.root}>
        <div className={classes.loginformbackground}>
          <div className={classes.loginform}>
            <div className={classes.title}>
              <div className={classes.titleIcon}>
                <FontAwesomeIcon icon={faRoute} />
              </div>
              Home Safe
            </div>
            <h2 className={classes.subtitle}>Welcome!</h2>
            <p className={classes.text}>
              Sign in to plan your SAFE route home:
            </p>
            <Button className={classes.button} onClick={handleSignIn}>
              Sign In with Google
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginPage;
