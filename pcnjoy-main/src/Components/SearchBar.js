import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import React, { useEffect } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import "@reach/combobox/styles.css";
import Geocode from "react-geocode";
import classes from "./SearchBar.module.css";

Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API);
Geocode.enableDebug();

function SearchBar(props) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 37.8826614, lng: () => -122.2844612 },
      radius: 40 * 1000,
      componentRestrictions: { country: "us" },
    },
  });

  useEffect(() => {
    setValue("");
  }, [props.markers]);

  return (
    <div>
      <Combobox
        onSelect={async (address) => {
          setValue(address, false);
          clearSuggestions();
          try {
            const results = await getGeocode({ address });
            const coord = await getLatLng(results[0]);
            props.setCoord(coord);
            props.setMarkers((current) => {
              if (current.length > 0) {
                let newArray = [...current];
                newArray[props.id] = {
                  key: `${coord.lat},${coord.lng}`,
                  address: `${address}`,
                  lat: coord.lat,
                  lng: coord.lng,
                };
                return newArray;
              } else {
                return [
                  ...current,
                  {
                    key: `${coord.lat},${coord.lng}`,
                    address: `${address}`,
                    lat: coord.lat,
                    lng: coord.lng,
                  },
                ];
              }
            });
          } catch (error) {
            console.log(error);
          }
        }}
      >
        <ComboboxInput
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          disabled={!ready || props.isRouted}
          placeholder={props.address ? props.address : "Enter an Address"}
        />
        <ComboboxPopover className={classes.searchBar}>
          {status === "OK" &&
            data.map(({ id, description }) => (
              <ComboboxOption
                className={classes.searchBar}
                key={id}
                value={description}
              />
            ))}
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}

export default SearchBar;
