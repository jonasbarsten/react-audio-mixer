import React from "react";

import Fader from "./Fader";
import Meter from "./Meter";

const Track = (props) => {
  return (
    <div className="track">
      {props.master ? null : <Meter {...props} />}
      <Fader {...props} />
    </div>
  );
};

export default Track;
