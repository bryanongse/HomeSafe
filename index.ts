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
      mapTypeId: "OSM",
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

  map.mapTypes.set("OSM", new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
        // "Wrap" x (longitude) at 180th meridian properly
        // NB: Don't touch coord.x: because coord param is by reference, and changing its x property breaks something in Google's lib
        var tilesPerGlobe = 1 << zoom;
        var x = coord.x % tilesPerGlobe;
        if (x < 0) {
            x = tilesPerGlobe+x;
        }
        // Wrap y (latitude) in a like manner if you want to enable vertical infinite scrolling

        return "https://tile.openstreetmap.org/" + zoom + "/" + x + "/" + coord.y + ".png";
    },
    tileSize: new google.maps.Size(256, 256),
    name: "OpenStreetMap",
    maxZoom: 18
}));

  // Create the search box and link it to the UI element.
  const input = document.getElementById("pac-input") as HTMLInputElement;
  const input2 = document.getElementById("pac-input2") as HTMLInputElement;
  const searchBox = new google.maps.places.SearchBox(input);
  const searchBox2 = new google.maps.places.SearchBox(input2);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds() as google.maps.LatLngBounds);
    searchBox2.setBounds(map.getBounds() as google.maps.LatLngBounds);
  });

  let start: google.maps.Marker[] = [];
  let end: google.maps.Marker[] = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    start.forEach((start) => {
      start.setMap(null);
    });
    start = [];

    // For each place, get the icon, name and location.
    const bounds = map.getBounds();

    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      // Create a marker for each place.
      start.push(
        new google.maps.Marker({
          map,
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

  searchBox2.addListener("places_changed", () => {
    const places2 = searchBox2.getPlaces();

    if (places2.length == 0) {
      return;
    }

    // Clear out the old markers.
    end.forEach((end) => {
      end.setMap(null);
    });
    end = [];

    // For each place, get the icon, name and location.
    const bounds = map.getBounds();

    places2.forEach((place) => {
      if (!place.geometry || !place.geometry.location) {
        console.log("Returned place contains no geometry");
        return;
      }

      // Create a marker for each place.
      end.push(
        new google.maps.Marker({
          map,
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

  poly = new google.maps.Polyline({
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 3,
    map: map,
  });

  const spinner = document.getElementById("spinner");

  document.getElementById("calc-route").addEventListener("click", () => {
    spinner.removeAttribute('hidden');
    console.log("test")

    const marker1Pos = start[0].getPosition();
    const marker2Pos = end[0].getPosition();
    const points = {"points": [[marker1Pos.lng(), marker1Pos.lat()],
        [marker2Pos.lng(), marker2Pos.lat()]],
        "safety_priority": (document.getElementById("safety-priority") as HTMLInputElement).value / 100};

    console.log(points);

    fetch("http://127.0.0.1:5000/route", {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(points)
    }).then((response) => response.json()).then((data) => {
        spinner.setAttribute('hidden', '');
        let path: google.maps.LatLng[] = [];
        for (let i = 0; i < data.length; i++) {
            path.push(new google.maps.LatLng(data[i][1], data[i][0]));
        }
        poly.setPath(path);
    });
  });

    fetch("http://127.0.0.1:5000/get_points", {
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
    }).then((response) => response.json()).then((data) => {
        let points = [];
        console.log(data);
        for (let i = 0; i < data.length; i++) {
            points.push({location: new google.maps.LatLng(data[i].point[0], data[i].point[1]), weight: 1 - data[i].safety});
        }
        console.log(points);
        heatmap = new google.maps.visualization.HeatmapLayer({
          data: points,
          map: map,
          dissipating: true,
          radius: 40,
          opacity: 0.7,
          maxIntensity: 10
        });
        document
          .getElementById("toggle-heatmap")
          .addEventListener("click", toggleHeatmap);
    })

    function toggleHeatmap() {
      heatmap.setMap(heatmap.getMap() ? null : map);
    }

        /*
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: coordinateToLatLngHM(coodinatesHeat()),
    // data: coodinatesHeat2(),
    map: map,
  });
 */

  update();
}


function update() {
  //const path = [
  //  marker1.getPosition() as google.maps.LatLng,
  //  marker2.getPosition() as google.maps.LatLng,
  //];

  // // poly.setPath(path);
  // // geodesicPoly.setPath(path);

  // // const heading = google.maps.geometry.spherical.computeHeading(
  // //   path[0],
  // //   path[1]
  // // );

  // (document.getElementById("heading") as HTMLInputElement).value =
  //   String(heading);
  //(document.getElementById("origin") as HTMLInputElement).value = String(
  //  path[0]
  //);
  //(document.getElementById("destination") as HTMLInputElement).value = String(
  //  path[1]
  //);
}

declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;
export {};
