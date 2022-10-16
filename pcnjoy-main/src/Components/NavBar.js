import React, { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import SavedPlace from "./SavedPlace";
import { Button, CloseButton } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRoute } from "@fortawesome/free-solid-svg-icons";

import { auth, db } from "../Firebase/firebase-config";
// import { doc, deleteDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Navigate } from "react-router-dom";

import classes from "./NavBar.module.css";
import Directions from "./Directions";

import "@fontsource/montserrat";

const searchBarLimit = 5;

function NavBar(props) {
  const [userSignOut, setUserSignOut] = useState(false);
  const [searchBar, setSearchBar] = useState([
    <SearchBar
      setCoord={props.setCoord}
      markers={props.markers}
      setMarkers={props.setMarkers}
      isRouted={props.isRouted}
      address={null}
      id={0}
      key={0}
    />,
  ]);
  const [SBLabels, setSBLabels] = useState([]);
  const [searchBarRemoval, setSearchBarRemoval] = useState([]);
  const [lngLat, setLngLat] = useState({});

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Sign out success");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  auth.onAuthStateChanged((user) => {
    if (user) {
      return setUserSignOut(false);
    } else {
      setUserSignOut(true);
    }
  });

  // when markers change -> SearchBars changes
  useEffect(() => {
    setSearchBar([]);
    if (props.markers.length > 0) {
      props.markers.forEach((marker) => {
        setSearchBar((current) => {
          if (current.length > 0) {
            let newArray = [...current];
            newArray[current.length] = (
              <SearchBar
                setCoord={props.setCoord}
                markers={props.markers}
                setMarkers={props.setMarkers}
                isRouted={props.isRouted}
                address={marker.address}
                id={current.length}
                key={current.length}
              />
            );
            return newArray;
          } else {
            return [
              ...current,
              <SearchBar
                setCoord={props.setCoord}
                markers={props.markers}
                setMarkers={props.setMarkers}
                isRouted={props.isRouted}
                address={marker.address}
                id={0}
                key={0}
              />,
            ];
          }
        });
      });
    } else {
      setSearchBar([
        <SearchBar
          setCoord={props.setCoord}
          markers={props.markers}
          setMarkers={props.setMarkers}
          isRouted={props.isRouted}
          address={null}
          id={0}
          key={0}
        />,
      ]);
    }
  }, [props.markers]);

  const getPath = (longLat) => {
    fetch("http://127.0.0.1:5000/route", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      //make sure to serialize your JSON body
      body: JSON.stringify(longLat),
    }).then((response) => { console.log(response); return response.json(); }).then((data) => { console.log(data); return data; });
  };

  // when SearchBar changes -> SBLabels and SearchBarRemoval changes
  useEffect(() => {
    setSBLabels([]);
    setSearchBarRemoval([]);
    if (searchBar.length > 0) {
      searchBar.forEach(() => {
        setSBLabels((current) => {
          if (current.length === 0) {
            return [...current, <p key={0}>Start</p>];
          } else if (current.length === searchBar.length - 1) {
            let newArray = [...current];
            newArray[current.length] = <p key={current.length}>End</p>;
            return newArray;
          } else {
            let newArray = [...current];
            newArray[current.length] = <p key={current.length}>Point</p>;
            return newArray;
          }
        });
        if (!props.displaySR) {
          setSearchBarRemoval((current) => {
            if (current.length > 0) {
              let newArray = [...current];
              newArray[current.length] = (
                <CloseButton
                  id={current.length}
                  onClick={searchBarRemovalClicked}
                />
              );
              return newArray;
            } else {
              return [
                ...current,
                <CloseButton
                  id={0}
                  onClick={searchBarRemovalClicked}
                  disabled={props.markers.length === 0}
                />,
              ];
            }
          });
        } else {
          setSearchBarRemoval([]);
        }
      });
    }
  }, [searchBar, props.isRouted]);

  const createSearchBar = () => {
    if (searchBar.length < searchBarLimit) {
      setSearchBar((current) => {
        if (current.length > 0) {
          let newArray = [...current];
          newArray[current.length] = (
            <SearchBar
              setCoord={props.setCoord}
              markers={props.markers}
              setMarkers={props.setMarkers}
              isRouted={props.isRouted}
              address={null}
              id={current.length}
              key={current.length}
            />
          );
          return newArray;
        } else {
          return [
            ...current,
            <SearchBar
              setCoord={props.setCoord}
              markers={props.markers}
              setMarkers={props.setMarkers}
              isRouted={props.isRouted}
              address={null}
              id={0}
              key={0}
            />,
          ];
        }
      });
    }
  };

  const searchBarRemovalClicked = (e) => {
    props.setRouteState(false);
    props.setMarkers((current) => {
      let newArray = [...current];
      newArray.splice(e.target.id, 1);
      return newArray;
    });
  };

  // when map loaded state change -> SearchBars changes
  useEffect(() => {
    if (props.mapsLoaded) {
      setSearchBar([]);
      setSearchBar([
        <SearchBar
          setCoord={props.setCoord}
          markers={props.markers}
          setMarkers={props.setMarkers}
          isRouted={props.isRouted}
          address={null}
          id={0}
          key={0}
        />,
      ]);
    } else {
      setSearchBar([]);
    }
  }, [props.mapsLoaded]);

  function routeHandler(showRoute) {
    if (showRoute) {
      props.setShowingAlert(true);
      props.setRouteReq(true);
      props.setRouteState(true);
    } else {
      if (props.displaySR) {
        props.setRouteState(false);
        props.setMarkers([]);
        props.setCleanRouteData({
          duration: null,
          distance: null,
          via: null,
          directions: [],
        });
        props.setrouteLatlngs([]);
        props.setDisplaySR(null);
      } else {
        props.setRouteState(false);
      }
    }
  }

  const removeSavedRoute = async () => {
    // const routeDoc = doc(db, "routes", props.displaySR.id);
    // await deleteDoc(routeDoc);
    props.setDisplaySR(null);
    routeHandler(false);
    props.setSRisChanged((prev) => !prev);
  };

  let body, buttons;
  if (props.isRouted) {
    buttons = (
      <div className={classes.searchBarButtons}>
        <Button variant="danger" onClick={() => routeHandler(false)}>
          Back
        </Button>
        {props.displaySR ? (
          <Button variant="secondary" onClick={removeSavedRoute}>
            Remove from Saved Routes
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => props.setShowSRModal(true)}
          >
            Add to Saved Routes
          </Button>
        )}
      </div>
    );

    body = (
      <div>
        <Directions data={props.cleanRouteData} displaySR={props.displaySR} />
      </div>
    );
  } else {
    buttons = (
      <div className={classes.searchBarButtons}>
        <Button
          onClick={createSearchBar}
          disabled={searchBar.length >= searchBarLimit}
        >
          + Add Point to Route
        </Button>
        <Button
          disabled={props.markers.length < 2}
          onClick={async () => {
            routeHandler(true);
            setLngLat({
              points: [
                [props.markers[0]["lng"], props.markers[0]["lat"]],
                [props.markers[1]["lng"], props.markers[1]["lat"]],
              ],
            });
            // console.log(lngLat);

            console.log("clicked");
            await getPath(lngLat).then((path) => {
                console.log(path);
                const route = path.map((point) => ({
                    lat: point[1],
                    lng: point[0],
                }));
                console.log(route);
                props.setrouteLatlngs(route);
            });
            console.log("done");
          }}
        >
          Done
        </Button>
      </div>
    );

    body = (
      <div className={classes.body}>
        <SavedPlace
          savedPlaces={props.savedPlaces}
          displaySP={props.displaySP}
          setDisplaySP={props.setDisplaySP}
          setCoord={props.setCoord}
          panToSP={props.panToSP}
          setPanToSP={props.setPanToSP}
        />
      </div>
    );
  }

  if (userSignOut) {
    return <Navigate to="/login" />;
  } else {
    return (
      <div className={classes.root}>
        <div className={classes.title}>
          <div className={classes.titleIcon}>
            <FontAwesomeIcon icon={faRoute} inverse />
          </div>
          <div className={classes.titleName}>Home Safe</div>
          <div className={classes.titleSignOut}>
            <Button onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
        <div className={classes.navBarContent}>
          <div className={classes.routeCreation}>
            <div className={classes.search}>
              <div className={classes.SBLabels}>{SBLabels}</div>
              <div className={classes.searchBar}>{searchBar}</div>
              <div className={classes.searchBarRemoval}>{searchBarRemoval}</div>
            </div>

            <div className={classes.button}>{buttons}</div>
          </div>

          <div className={classes.body}>{body}</div>
        </div>
      </div>
    );
  }
}

export default NavBar;
