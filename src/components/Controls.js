import React, { useContext, useState, useEffect } from "react";
import { HiOutlineSave } from "react-icons/hi";

import Clock from "./Clock";
import { AudioContext } from "../context/Audio";

import "./Controls.scss";

const Controls = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const audioContext = useContext(AudioContext);
  const recording = audioContext.recording();

  const pausedClass = audioContext.playing() ? "" : "paused";
  const recordingClass = recording ? "recording" : "";

  useEffect(() => {
    if (!audioContext.playing()) {
      return;
    }
    const interval = setInterval(() => {
      const newCurrentTime = audioContext.getCurrentTime();
      setCurrentTime(newCurrentTime);
    }, 100);

    return () => clearInterval(interval);
  }, [audioContext]);

  const toggleRecord = () => {
    audioContext.toggleRecord(!recording);
  };

  return (
    <div id="controls">
      <Clock seconds={currentTime} />
      <div className="buttons">
        <button
          className="control-item start"
          onClick={() => {
            audioContext.backToStart();
            // The interval will not run when not playing, so we set it "manually" here
            setCurrentTime(0);
          }}
        ></button>
        <button
          className="control-item rw"
          onClick={() => audioContext.rewind()}
        ></button>
        <button
          className={`control-item play ${pausedClass}`}
          onClick={() => audioContext.togglePlayAll()}
        ></button>
        <button
          className={`control-item record ${recordingClass}`}
          onClick={toggleRecord}
        ></button>
        <button
          className="control-item ff"
          onClick={() => audioContext.forward()}
        ></button>
        <button
          className="control-item save"
          onClick={() => audioContext.exportAudio()}
        >
          <HiOutlineSave />
        </button>
      </div>
    </div>
  );
};

export default Controls;
