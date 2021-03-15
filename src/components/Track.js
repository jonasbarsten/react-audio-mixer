import React from "react";

import Fader from "./Fader";
import Meter from "./Meter";
// import MeterTest from "./MeterTest";

const Track = ({ master = false, gainNode, meterValue }) => {
  return (
    <div className="track">
      {master ? null : <Meter gainNode={gainNode} />}
      {/* {master ? null : <MeterTest meterValue={meterValue} />} */}
      <Fader master={master} gainNode={gainNode} />
    </div>
  );
};

export default Track;
