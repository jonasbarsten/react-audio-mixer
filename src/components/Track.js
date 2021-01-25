import React from "react";

import Fader from "./Fader";
import Meter from "./Meter";

const Track = (props) => {
  return (
    <div className="track">
      <Meter dBFS={props.dBFS} />
      <Fader {...props} />
    </div>
  );
};

export default Track;
