import React from "react";
import clock from "../Assets/clock.png";
import length from "../Assets/length.png";

import classes from "./Directions.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/montserrat";

function Directions(props) {
  const listDirs = props.data.directions.map((dir) => (
    <div>
      <p className={classes.text}>{dir}</p>
      <hr className={classes.rounded}></hr>
    </div>
  ));

  return (
    <div className={classes.root}>
      <div>{props.displaySR ? <h1>{props.displaySR.name}</h1> : null}</div>
      <div className={classes.timeDistContainer}>
        <div className={classes.indivContainer}>
          <img className={classes.icon} src={clock} />
          <h1 className={classes.timeDist}> {props.data.duration} </h1>
        </div>

        <div className={classes.indivContainer}>
          <img className={classes.icon} src={length} />
          <h1 className={classes.timeDist}> {props.data.distance} </h1>
        </div>
      </div>

      <div className={classes.desc}>
        <h1 className={classes.title}>Via</h1>
        <p className={classes.text}> {props.data.via} </p>
      </div>

      <hr className={classes.rounded}></hr>

      <div>
        <h1 className={classes.title}>Directions</h1>
        {listDirs}
      </div>
    </div>
  );
}

export default Directions;
