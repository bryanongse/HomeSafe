/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

// This example requires the Geometry library. Include the libraries=geometry
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=geometry">

let marker1: google.maps.Marker, marker2: google.maps.Marker;
let poly: google.maps.Polyline, geodesicPoly: google.maps.Polyline;
let map: google.maps.Map, heatmap: google.maps.visualization.HeatmapLayer;

function coordinatesPoly(){
  return [[40,-74],  [40, -74.1], [40.1,-74.1], [40.1, -74]];
};

function coodinatesHeat(){
  return [[1,1],[[40.01,-74.01], [40.01,-74.01]]];
};  

function coodinatesHeat2(){
  return [
    new google.maps.LatLng(37.782551, -122.445368),
    new google.maps.LatLng(37.782745, -122.444586),
    new google.maps.LatLng(37.782842, -122.443688)];
};  

function coordinateToLatLng(a){
  let b: google.maps.LatLng[];
  b = [];
  let weights: number[];
  a[0]

  for (let i = 0; i < a.length; i++){
    b.push(new google.maps.LatLng(a[i][0], a[i][1]));
  };
  return b;
};

function coordinateToLatLngHM(a){
  // let b: google.maps.LatLng[];
  var b;
  b = [];

  for (let i = 0; i < a[0].length; i++){
    b.push({location: new google.maps.LatLng(a[1][i][0], a[1][i][1]), weight: a[0][i]});
  };
  console.log(b);
  return b;
};


function initMap(): void {
  map = new google.maps.Map(
    document.getElementById("map") as HTMLElement,
    {
      center: { lat: 37.775, lng: -122.434 },
      zoom: 12,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],
    }
  );


  heatmap = new google.maps.visualization.HeatmapLayer({
    data: coordinateToLatLngHM(coodinatesHeat()),
    // data: coodinatesHeat2(),
    map: map,
  });
  

  let a: number[][];
  a = coordinatesPoly();

  poly = new google.maps.Polyline({
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 3,
    map: map,
  });

  let pathCoord: google.maps.LatLng[];
  pathCoord = coordinateToLatLng(a);
  poly.setPath(pathCoord);

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(
    document.getElementById("info") as HTMLElement
  );

  marker1 = new google.maps.Marker({
    map,
    draggable: false,
    animation: google.maps.Animation.DROP,
    position: pathCoord[0],
  });

  marker2 = new google.maps.Marker({
    map,
    draggable: false,
    position: pathCoord[pathCoord.length-1],
  });

  const bounds = new google.maps.LatLngBounds(
    marker1.getPosition() as google.maps.LatLng,
    marker2.getPosition() as google.maps.LatLng
  );

  map.fitBounds(bounds);

  google.maps.event.addListener(marker1, "position_changed", update);
  google.maps.event.addListener(marker2, "position_changed", update);
  

  // geodesicPoly = new google.maps.Polyline({
  //   strokeColor: "#CC0099",
  //   strokeOpacity: 1.0,
  //   strokeWeight: 3,
  //   geodesic: true,
  //   map: map,
  // });

  update();
}

function update() {
  const path = [
    marker1.getPosition() as google.maps.LatLng,
    marker2.getPosition() as google.maps.LatLng,
  ];

  // // poly.setPath(path);
  // // geodesicPoly.setPath(path);

  // // const heading = google.maps.geometry.spherical.computeHeading(
  // //   path[0],
  // //   path[1]
  // // );

  // (document.getElementById("heading") as HTMLInputElement).value =
  //   String(heading);
  (document.getElementById("origin") as HTMLInputElement).value = String(
    path[0]
  );
  (document.getElementById("destination") as HTMLInputElement).value = String(
    path[1]
  );
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export {};
