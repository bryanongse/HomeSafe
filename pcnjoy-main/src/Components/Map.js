import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";
import Geocode from "react-geocode";
import { Button, Modal, FloatingLabel, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "../Firebase/firebase-config";
import {
  collection,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  GeoPoint,
} from "firebase/firestore";

import classes from "./Map.module.css";
import historicSites from "../Assets/historic-sites.json";
import monuments from "../Assets/monuments.json";
import "@fontsource/montserrat";

import walkroute from "../Assets/walkroute.png";
import saved from "../Assets/saved.png";
import select from "../Assets/select.png";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const center = {
  lat: 37.8717919,
  lng: -122.2636093,
};
const options = {
  disableDefaultUI: true,
};

const markersLimit = 5;

Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API);
Geocode.enableDebug();

function Map(props) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API,
    libraries,
  });
  const [check, setCheck] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showSPModal, setShowSPModal] = useState(false);
  const [SPModalValue, setSPModalValue] = useState("");

  // For backend
  const savedPlacesRef = collection(db, "places");
  const savedRoutesRef = collection(db, "routes");

  useEffect(() => {
    let isMounted = true;
    if (mapRef.current && props.coord && isMounted) {
      mapRef.current.panTo(props.coord);
    }
    setSelected(null);
    // console.log("here");
    // console.log(props.coord);
    return () => {
      isMounted = false;
    };
  }, [props.coord]);

  const onMapClick = useCallback((event) => {
    try {
      setSelected(null);
      setCheck(() => ({
        key: `${event.latLng.lat()},${event.latLng.lng()}`,
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        isLandmark: false,
      }));
    } catch (error) {
      console.log(error);
    }
  }, []);

  const mapRef = useRef();
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // function to check if point is in saved
  function checkSaved() {
    if (props.savedPlaces.length > 0) {
      for (let i = 0; i < props.savedPlaces.length; i++) {
        if (
          props.savedPlaces[i].lat === selected.lat &&
          props.savedPlaces[i].lng === selected.lng
        ) {
          return props.savedPlaces[i].id;
        }
      }
    }
    return false;
  }

  function checkLandmark() {
    for (let i = 0; i < historicSites.length; i++) {
      if (
        historicSites[i].lat === selected.lat &&
        historicSites[i].long === selected.lng
      ) {
        return true;
      }
    }
    for (let i = 0; i < monuments.length; i++) {
      if (
        monuments[i].lat === selected.lat &&
        monuments[i].long === selected.lng
      ) {
        return true;
      }
    }
    return false;
  }

  const addPointToRoute = () => {
    props.setRouteState(false);
    props.setMarkers((current) => {
      if (current.length > 0) {
        let newArray = [...current];
        newArray[current.length] = {
          key: `${selected.lat},${selected.lng}`,
          address:
            selected.isLandmark || selected.isSaved
              ? `${selected.address}`
              : `${props.address}`,
          lat: selected.lat,
          lng: selected.lng,
        };
        return newArray;
      } else {
        return [
          ...current,
          {
            key: `${selected.lat},${selected.lng}`,
            address:
              selected.isLandmark || selected.isSaved
                ? `${selected.address}`
                : `${props.address}`,
            lat: selected.lat,
            lng: selected.lng,
          },
        ];
      }
    });
    setSelected(null);
    setCheck(null);
  };

  const removePointFromRoute = () => {
    props.setRouteState(false);
    props.setMarkers((current) => {
      let newArray = [...current];
      for (var i = 0; i < newArray.length; i++) {
        if (newArray[i].key === selected.key) {
          newArray.splice(i, 1);
          break;
        }
      }
      return newArray;
    });
    setCheck(null);
    setSelected(null);
  };

  ////// ADD REMOVE SAVED PLACES ////////
  useEffect(() => {
    if (props.panToSP) {
      setSelected(props.panToSP);
    }
  }, [props.panToSP]);

  const addSavedPlace = async () => {
    await addDoc(savedPlacesRef, {
      name: SPModalValue,
      lat: selected.lat,
      lng: selected.lng,
      userId: props.userId,
    });
    setSelected(null);
    setCheck(null);
    setSPModalValue("");
    SPModalHandleClose();
    props.setSPisChanged((prev) => !prev);
  };

  const SPModalHandleClose = () => setShowSPModal(false);

  const removeSavedPlace = async () => {
    const placeId = checkSaved();
    const placeDoc = doc(db, "places", placeId);
    await deleteDoc(placeDoc);
    setSelected(null);
    setCheck(null);
    props.setSPisChanged((prev) => !prev);
  };

  ////// ADD SAVED ROUTES ////////
  const SRModalHandleClose = () => props.setShowSRModal(false);

  const addSavedRoute = async () => {
    const routeGeoPoints = props.routeLatlngs.map(
      (point) => new GeoPoint(point.lat, point.lng)
    );
    const routeMarkers = props.markers.map(
      (point) => new GeoPoint(point.lat, point.lng)
    );
    const markerNames = props.markers.map((point) => point.address);
    const docRef = await addDoc(savedRoutesRef, {
      name: props.SRModalValue,
      userId: props.userId,
      routeGeoPoints: routeGeoPoints,
      directions: props.cleanRouteData.directions,
      distance: props.cleanRouteData.distance,
      duration: props.cleanRouteData.duration,
      via: props.cleanRouteData.via,
      routeMarkers: routeMarkers,
      markerNames: markerNames,
    });

    // get newly added route
    const newDoc = await getDoc(docRef);
    const newRoute = { ...newDoc.data(), id: docRef.id };
    props.setSRisChanged((prev) => !prev);
    props.setDisplaySR(newRoute);
    SRModalHandleClose();
  };

  if (!isLoaded) {
    return "Loading Maps";
  } else {
    props.setMapsLoaded(true);
  }

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={16}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {props.markers.map((marker) => (
          <Marker
            key={`${marker.lat},${marker.lng}`}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              url: walkroute,
              scaledSize: new window.google.maps.Size(35, 35),
            }}
            onClick={() => {
              setSelected(marker);
            }}
          />
        ))}

        {props.displaySP.length > 0
          ? props.displaySP.map((place) => (
              <Marker
                key={`${place.lat},${place.lng}`}
                position={{ lat: place.lat, lng: place.lng }}
                icon={{
                  url: saved,
                  scaledSize: new window.google.maps.Size(35, 35),
                }}
                onClick={() => {
                  setSelected({
                    key: place.lat.toString() + ", " + place.lng.toString(),
                    address: place.name,
                    lat: place.lat,
                    lng: place.lng,
                    isSaved: true,
                    id: place.id,
                  });
                }}
              />
            ))
          : null}

        {check ? (
          <Marker
            key={`${check.lat}, ${check.lng}`}
            position={{ lat: check.lat, lng: check.lng }}
            onClick={() => {
              setSelected(check);
            }}
            onRightClick={() => {
              setCheck(null);
              setSelected(null);
            }}
            icon={{
              url: select,
              scaledSize: new window.google.maps.Size(35, 35),
            }}
          />
        ) : null}

        {selected ? (
          <InfoWindow
            options={{ pixelOffset: new window.google.maps.Size(-1, -35) }}
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => {
              setSelected(null);
              props.setAddress(null);
            }}
          >
            <div className={classes.infoWindow}>
              <div>
                {checkLandmark() || checkSaved() ? (
                  <h5>{selected.address}</h5>
                ) : Geocode.fromLatLng(selected.lat, selected.lng).then(
                    (Response) => {
                      props.setAddress(
                        Response.results[0].formatted_address
                          .toString()
                          .replace(/(, )*Singapore( (\d)*)?/, "")
                      );
                    },
                    (Error) => {
                      console.log(Error);
                    }
                  ) ? (
                  <h5>{props.address ? props.address : "Invalid Address"}</h5>
                ) : (
                  <h5>Invalid Address</h5>
                )}
              </div>
              <p>
                {parseFloat(selected.lat).toFixed(3)},{" "}
                {parseFloat(selected.lng).toFixed(3)}
              </p>

              <div className={classes.buttons}>
                {checkSaved() ? (
                  <Button onClick={removeSavedPlace}>
                    Remove from Saved Place
                  </Button>
                ) : !checkLandmark() ? (
                  <Button onClick={() => setShowSPModal(true)}>
                    Add to Saved Place
                  </Button>
                ) : null}
                {props.markers.includes(selected) ? (
                  <Button onClick={removePointFromRoute}>
                    Remove from Route
                  </Button>
                ) : (
                  <Button
                    onClick={addPointToRoute}
                    disabled={props.markers.length >= markersLimit}
                  >
                    Add to Route
                  </Button>
                )}
              </div>
            </div>
          </InfoWindow>
        ) : null}
        <Polyline
          path={props.routeLatlngs}
          geodesic={true}
          options={{
            strokeColor: "#ff2527",
            strokeOpacity: 0.75,
            strokeWeight: 2,
          }}
        />

        {showSPModal ? (
          <Modal
            show={showSPModal}
            onHide={SPModalHandleClose}
            backdrop="static"
            keyboard={false}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Add to Saved Places</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Location: {props.address}
              <FloatingLabel
                controlId="floatingInput"
                label="Enter a name for your saved place"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="Enter a name for your saved place"
                  onChange={(e) => {
                    setSPModalValue(e.target.value);
                  }}
                />
              </FloatingLabel>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={SPModalHandleClose}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={addSavedPlace}
                disabled={!SPModalValue}
              >
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        ) : null}

        {props.showSRModal ? (
          <Modal
            show={props.showSRModal}
            onHide={SRModalHandleClose}
            backdrop="static"
            keyboard={false}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Add to Saved Routes</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              PCNs: {props.cleanRouteData.via}
              <FloatingLabel
                controlId="floatingInput"
                label="Enter a name for your saved route"
                className="mb-3"
              >
                <Form.Control
                  type="text"
                  placeholder="Enter a name for your saved route"
                  onChange={(e) => {
                    props.setSRModalValue(e.target.value);
                  }}
                />
              </FloatingLabel>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={SRModalHandleClose}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={addSavedRoute}
                disabled={!props.SRModalValue}
              >
                Confirm
              </Button>
            </Modal.Footer>
          </Modal>
        ) : null}
      </GoogleMap>
    </div>
  );
}

export default Map;
