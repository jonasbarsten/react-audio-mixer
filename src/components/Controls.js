import React, { useContext } from "react";

import Clock from "./Clock";
import { AudioContext } from "../context/Audio";

const Controls = () => {
  const audioContext = useContext(AudioContext);
  const playingClass = audioContext.playing() ? "" : "paused";

  return (
    <div id="controls">
      <Clock seconds={340} />
      <div className="buttons">
        <button className="btn-cntrl start"></button>
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
