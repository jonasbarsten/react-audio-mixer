import React, { useContext, useEffect, useState } from "react";

import Clock from "./Clock";
import { AudioContext } from "../context/Audio";
import { unstable_renderSubtreeIntoContainer } from "react-dom";

const Controls = () => {
  const audioContext = useContext(AudioContext);
  // const [currentTime, setCurrentTime] = useState(0);
  const playingClass = audioContext.playing() ? "" : "paused";

  // console.log(currentTime);

  return (
    <div id="controls">
      <Clock seconds={audioContext.getCurrentTime()} />
      <div className="buttons">
        <button
          className="btn-cntrl start"
          onClick={() => audioContext.backToStart()}
        ></button>
        <button className="btn-cntrl rw"></button>
        <button
          className={`btn-cntrl play ${playingClass}`}
          onClick={() => audioContext.togglePlayAll()}
        ></button>
        <button className="btn-cntrl ff"></button>
      </div>
    </div>
  );
};

export default Controls;
