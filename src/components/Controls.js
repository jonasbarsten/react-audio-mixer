import React, { useContext, useState, useEffect } from "react";

import Clock from "./Clock";
import { AudioContext } from "../context/Audio";

const Controls = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const audioContext = useContext(AudioContext);
  const playingClass = audioContext.playing() ? "" : "paused";

  useEffect(() => {
    if (!audioContext.playing()) {
      return;
    }

    const interval = setInterval(() => {
      console.log("Booom");
      const newCurrentTime = audioContext.setAndGetCurrentTime();
      setCurrentTime(newCurrentTime);
    }, 100);

    return () => clearInterval(interval);
  }, [audioContext]);

  return (
    <div id="controls">
      <Clock seconds={currentTime} />
      <div className="buttons">
        <button
          className="btn-cntrl start"
          onClick={() => audioContext.backToStart()}
        ></button>
        <button
          className="btn-cntrl rw"
          onClick={() => audioContext.rewind()}
        ></button>
        <button
          className={`btn-cntrl play ${playingClass}`}
          onClick={() => audioContext.togglePlayAll()}
        ></button>
        <button
          className="btn-cntrl ff"
          onClick={() => audioContext.forward()}
        ></button>
        <button onClick={() => audioContext.exportAudio()}>Save</button>
        <button onClick={() => audioContext.record()}>Record</button>
        <button onClick={() => audioContext.recordStop()}>Stop Record</button>
      </div>
    </div>
  );
};

export default Controls;
