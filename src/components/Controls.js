import React, { useContext, useState, useEffect } from "react";

import Clock from "./Clock";
import { AudioContext } from "../context/Audio";

const Controls = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const audioContext = useContext(AudioContext);
  const playingClass = audioContext.playing() ? "" : "paused";

  useEffect(() => {
    console.log("Booom");
    if (!audioContext.playing()) {
      return;
    }
    console.log("Went past");
    const interval = setInterval(() => {
      const newCurrentTime = audioContext.getCurrentTime();
      console.log(newCurrentTime);
      setCurrentTime(newCurrentTime);
    }, 100);

    return () => clearInterval(interval);
  }, [audioContext.playing()]);

  return (
    <div id="controls">
      <Clock seconds={currentTime} />
      <div className="buttons">
        <button
          className="btn-cntrl start"
          onClick={() => {
            audioContext.backToStart();
            // The interval will not run when not playing, so we set it manually here
            setCurrentTime(0);
          }}
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
      </div>
    </div>
  );
};

export default Controls;
