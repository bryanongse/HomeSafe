import React from "react";
import { Accordion, Form, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import classes from "./SavedPlace.module.css";

function SavedPlace(props) {
  const handleClick = (e) => {
    if (e.target.checked) {
      props.setDisplaySP(props.savedPlaces);
    } else {
      props.setDisplaySP([]);
    }
  };

  function showPlace(place) {
    props.setCoord({ lat: place.lat, lng: place.lng });
    // convert place into selected
    const sp = {
      key: place.lat.toString() + ", " + place.lng.toString(),
      address: place.name,
      lat: place.lat,
      lng: place.lng,
      isSaved: true,
      id: place.id,
    };
    if (props.displaySP.length < 2) {
      props.setDisplaySP([place]);
    }
    props.setPanToSP(sp);
  }

  return (
    <div>
      <Accordion defaultActiveKey="0" className={classes.accordion}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Saved Places</Accordion.Header>
          <Accordion.Body>
            <div>
              {props.savedPlaces.length > 0 ? (
                <Form.Check
                  type="switch"
                  id="saved-places"
                  label="Show All"
                  defaultChecked={true}
                  onClick={handleClick}
                />
              ) : (
                <p>You have no saved places</p>
              )}
            </div>
            {props.savedPlaces.length > 0
              ? props.savedPlaces.map((place) => (
                  <div className={classes.buttons}>
                    <Button
                      variant="link"
                      className={classes.indivButton}
                      onClick={() => showPlace(place)}
                    >
                      {place.name}
                    </Button>
                  </div>
                ))
              : null}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default SavedPlace;
