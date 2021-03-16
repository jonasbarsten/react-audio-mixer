import React from "react";

import Fader from "./Fader";
import Meter from "./Meter";

const Track = ({ master = false, gainNode }) => {
  return (
    <div className="track">
      {master ? null : <Meter gainNode={gainNode} />}
      <Fader master={master} gainNode={gainNode} />
    </div>
  );
};

export default Track;
