let marker1: google.maps.Marker, marker2: google.maps.Marker;
let poly: google.maps.Polyline, geodesicPoly: google.maps.Polyline;
let map: google.maps.Map, heatmap: google.maps.visualization.HeatmapLayer;

function coordinatesHeat2(){
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
      center: {lat: 37.868683, lng: -122.259131},
      zoom: 12,
    }
  );
  
  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input") as HTMLInputElement;
  const searchBox = new google.maps.places.SearchBox(input);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
  });

  let markers: google.maps.Marker[] = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      const icon = {
        url: place.icon as string,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map,
          icon,
          title: place.name,
          position: place.geometry.location,
        })
      );

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

  /*
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: coordinateToLatLngHM(coodinatesHeat()),
    // data: coodinatesHeat2(),
    map: map,
  });
 */


  let pathCoord = coordinatesHeat2();

  poly = new google.maps.Polyline({
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 3,
    map: map,
  });

  poly.setPath(pathCoord);

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(
    document.getElementById("info") as HTMLElement
  );

  marker1 = new google.maps.Marker({
    map,
    animation: google.maps.Animation.DROP,
    position: pathCoord[0],
  });

  marker2 = new google.maps.Marker({
    map,
    draggable: true,
    position: pathCoord[pathCoord.length-1],
  });

  const bounds = new google.maps.LatLngBounds(
    marker1.getPosition() as google.maps.LatLng,
    marker2.getPosition() as google.maps.LatLng
  );

  map.fitBounds(bounds);

  const marker1Pos = marker1.getPosition();
  const marker2Pos = marker2.getPosition();
  const points = {"points": [[marker1Pos.lng(), marker1Pos.lat()],
      [marker2Pos.lng(), marker2Pos.lat()]]};
  fetch("http://127.0.0.1:5000/route", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(points)
  }).then((response) => response.json()).then((data) => {
      let path: google.maps.LatLng[] = [];
      for (let i = 0; i < data.length; i++) {
          path.push(new google.maps.LatLng(data[i][1], data[i][0]));
      }
      poly.setPath(path);
  });

  //google.maps.event.addListener(marker1, "position_changed", update);
  //google.maps.event.addListener(marker2, "position_changed", update);


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
