import React, { useState, useEffect } from "react";
import Map from "../Components/Map";
import NavBar from "../Components/NavBar";
import "bootstrap/dist/css/bootstrap.min.css";
import classes from "./MainPage.module.css";
import { auth, db } from "../Firebase/firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Navigate } from "react-router-dom";
import "@fontsource/montserrat";

function MainPage() {
  const [mapsLoaded, setMapsLoaded] = useState(null);
  const [coord, setCoord] = useState({ lat: 1.3521, lng: 103.8198 });
  const [markers, setMarkers] = useState([]);
  const [address, setAddress] = useState(null);
  const [token, setToken] = useState();
  const [routeData, setRouteData] = useState([]);
  const [cleanRouteData, setCleanRouteData] = useState({
    duration: null,
    distance: null,
    via: null,
    directions: [],
  });
  const [userId, setUserId] = useState("");
  const [isShowingAlert, setShowingAlert] = useState(false);

  const [routeReq, setRouteReq] = useState(false);
  const [isRouted, setRouteState] = useState(false);
  const [routeLatlngs, setrouteLatlngs] = useState([]);

  const [histSiteCheck, setHistSite] = useState(false);
  const [monumentCheck, setMonument] = useState(false);

  const [savedPlaces, setSavedPlaces] = useState([]);
  const [SPisChanged, setSPisChanged] = useState(false);
  const [displaySP, setDisplaySP] = useState([]);
  const [panToSP, setPanToSP] = useState(null);

  const [showSRModal, setShowSRModal] = useState(false);
  const [SRModalValue, setSRModalValue] = useState("");
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [SRisChanged, setSRisChanged] = useState(false);
  const [displaySR, setDisplaySR] = useState(null);

  const savedPlacesRef = collection(db, "places");
  const savedRoutesRef = collection(db, "routes");

  var server =
    process.env.NODE_ENV === "development"
      ? process.env.REACT_APP_LOCAL
      : process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_HEROKU
      : null;

  auth.onAuthStateChanged((user) => {
    if (user) {
      // getToken();
      const user = auth.currentUser;
      setUserId(user.uid);
    } else {
      return <Navigate to="/login" />;
    }
  });

  useEffect(() => {
    if (userId !== "") {
      getSavedPlaces();
    }
  }, [userId, SPisChanged]);

  useEffect(() => {
    setDisplaySP(savedPlaces);
  }, [savedPlaces]);

  useEffect(() => {
    if (userId !== "") {
      getSavedRoutes();
    }
  }, [userId, SRisChanged]);

  useEffect(() => {
    // for setmarkers
    function buildMarkers(routeMarkers, markerNames) {
      var builtMarkers = [];
      for (let i = 0; i < routeMarkers.length; i++) {
        var routeMarker = {
          address: markerNames[i],
          key:
            routeMarkers[i]._lat.toString() + routeMarkers[i]._long.toString(),
          lat: routeMarkers[i]._lat,
          lng: routeMarkers[i]._long,
        };
        builtMarkers.push(routeMarker);
      }
      return builtMarkers;
    }

    // // for setRouteLatLong
    function buildRoute(routeGeoPoints) {
      const builtRoute = routeGeoPoints.map((point) => ({
        lat: point._lat,
        lng: point._long,
      }));
      return builtRoute;
    }

    if (displaySR) {
      // for setCleanRouteData
      const builtRouteData = {
        directions: displaySR.directions,
        distance: displaySR.distance,
        duration: displaySR.duration,
        via: displaySR.via,
      };
      setCleanRouteData(builtRouteData);

      // setRouteLatLong
      const builtRoute = buildRoute(displaySR.routeGeoPoints);
      setrouteLatlngs(builtRoute);

      // setMarkers
      const builtMarkers = buildMarkers(
        displaySR.routeMarkers,
        displaySR.markerNames
      );
      setMarkers(builtMarkers);

      // setRouteState
      setRouteState(true);
    }
  }, [displaySR]);

  async function getSavedPlaces() {
    const q = query(savedPlacesRef, where("userId", "==", userId));
    const places = await getDocs(q);
    const placesData = places.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setSavedPlaces(placesData);
  }

  async function getSavedRoutes() {
    const q = query(savedRoutesRef, where("userId", "==", userId));
    const routes = await getDocs(q);
    const routesData = routes.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setSavedRoutes(routesData);
  }

  // async function getToken() {
  //   try {
  //     const url = `${server}/getToken`;
  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: { "content-type": "application/json" },
  //     });

  //     const data = await response.json();
  //     setToken(data.access_token);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // Remove route when isRouted false
  useEffect(() => {
    if (!isRouted) {
      setrouteLatlngs([]);
    }
  }, [isRouted]);

  useEffect(() => {
    const getAllRoutes = async () => {
      let routes = [];
      for (let i = 0; i < markers.length - 1; i++) {
        const route = await getRoute(markers[i].key, markers[i + 1].key);
        routes = [...routes, route];
      }
      // console.log("Here");
      // console.log(markers[0]['lat']);
      setRouteData(routes); // set route data only once
      setRouteReq(false); // reset routereq to false
    };

    async function getRoute(start, end) {
      try {
        const url = `${server}/route`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            start: start,
            end: end,
            routeType: "cycle",
            token: token,
          }),
        });
        const data = await response.json();
        return data;
      } catch (error) {
        console.log(error);
      }
      // ERROR HANDLE NO ROUTE FOUND!!
    }

    // Action
    if (routeReq) {
      // check to ensure getAllRoutes() only called when routeReq true
      getAllRoutes();
    }
  }, [routeReq]);

  useEffect(() => {
    const plot = async () => {
      if (routeData.length > 0) {
        await plotRoute();
      }
    };
    plot();

    async function plotRoute() {
      // data cleaning
      var timeSeconds = 0;
      var dist = 0;
      var viaArray = [];
      var directions = [];

      for (let k = 0; k < routeData.length; k++) {
        timeSeconds += routeData[k].route_summary.total_time;
        dist += routeData[k].route_summary.total_distance;
        viaArray = viaArray.concat(routeData[k].route_name);
        routeData[k].route_instructions.forEach((item) => {
          directions.push(item[9]);
        });
      }

      const timeHM =
        timeSeconds >= 3600
          ? Math.floor(timeSeconds / 3600) +
            "hr " +
            Math.floor((timeSeconds % 3600) / 60) +
            "min"
          : Math.floor(timeSeconds / 60) + "min";
      const distKm = Math.round(dist / 1000) + "km";
      const via = viaArray.join(", ");

      setCleanRouteData({
        duration: timeHM,
        distance: distKm,
        via: via,
        directions: directions,
      });

      // decode polyline
      var latlngs = [];
      for (let j = 0; j < routeData.length; j++) {
        var encoded = routeData[j].route_geometry;
        var polyUtil = require("polyline-encoded");
        var latlngArray = polyUtil.decode(encoded);

        latlngArray.forEach((item) => {
          var output = {
            lat: item[0],
            lng: item[1],
          };
          latlngs.push(output);
        });
      }
      setrouteLatlngs(latlngs);
    }
    // oneMap Routing Api
  }, [routeData]);

  return (
    <div className={classes.root}>
      <div
        className={`alert alert-danger ${
          isShowingAlert ? classes.alertShow : classes.alertHide
        }`}
        onTransitionEnd={() => setShowingAlert(false)}
      >
        ⚠️ Always remember to be wary of your surroundings!
      </div>
      <div className={classes.Map}>
        <Map
          setMapsLoaded={setMapsLoaded}
          setRouteState={setRouteState}
          routeLatlngs={routeLatlngs}
          cleanRouteData={cleanRouteData}
          coord={coord}
          markers={markers}
          setMarkers={setMarkers}
          address={address}
          setAddress={setAddress}
          routeData={routeData}
          setHistSite={setHistSite}
          histSiteCheck={histSiteCheck}
          setMonument={setMonument}
          monumentCheck={monumentCheck}
          savedPlaces={savedPlaces}
          setSavedPlaces={setSavedPlaces}
          setUserId={setUserId}
          userId={userId}
          setSPisChanged={setSPisChanged}
          SPisChanged={SPisChanged}
          displaySP={displaySP}
          setDisplaySP={setDisplaySP}
          showSRModal={showSRModal}
          setShowSRModal={setShowSRModal}
          SRModalValue={SRModalValue}
          setSRModalValue={setSRModalValue}
          setSRisChanged={setSRisChanged}
          SRisChanged={SRisChanged}
          savedRoutes={savedRoutes}
          setDisplaySR={setDisplaySR}
          displaySR={displaySR}
          panToSP={panToSP}
          setPanToSP={setPanToSP}
        />
      </div>
      <div className={classes.NavBar}>
        <NavBar
          mapsLoaded={mapsLoaded}
          setCoord={setCoord}
          markers={markers}
          setMarkers={setMarkers}
          address={address}
          setAddress={setAddress}
          setRouteReq={setRouteReq}
          setRouteState={setRouteState}
          isRouted={isRouted}
          cleanRouteData={cleanRouteData}
          setCleanRouteData={setCleanRouteData}
          routeLatlngs={routeLatlngs}
          setrouteLatlngs={setrouteLatlngs}
          setHistSite={setHistSite}
          histSiteCheck={histSiteCheck}
          setMonument={setMonument}
          monumentCheck={monumentCheck}
          savedPlaces={savedPlaces}
          setUserId={setUserId}
          userId={userId}
          setShowingAlert={setShowingAlert}
          setSPisChanged={setSPisChanged}
          SPisChanged={SPisChanged}
          displaySP={displaySP}
          setDisplaySP={setDisplaySP}
          showSRModal={showSRModal}
          setShowSRModal={setShowSRModal}
          SRModalValue={SRModalValue}
          setSRModalValue={setSRModalValue}
          setSRisChanged={setSRisChanged}
          SRisChanged={SRisChanged}
          savedRoutes={savedRoutes}
          setDisplaySR={setDisplaySR}
          displaySR={displaySR}
          panToSP={panToSP}
          setPanToSP={setPanToSP}
        />
      </div>
    </div>
  );
}

export default MainPage;
