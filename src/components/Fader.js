import React, { useState, useContext } from "react";
import Draggable from "react-draggable";

import { AudioContext } from "../context/Audio";

import { scale } from "../utils";

import "./Fader.scss";

const Fader = ({ master, gainNode }) => {
  // Ugly hack to set fader all the way down if initial gain is 0
  const [position, setPosition] = useState(
    gainNode && gainNode.gain.value === 0 ? 20 : -171
  );
  const audioContext = useContext(AudioContext);

  // TODO: do this in audio context to have more control
  // Could save fader state etc if needed

  const handleDrag = (e, data, max) => {
    setPosition(data.y);
    const scaled = data.y + 200;
    const gain = Math.pow(scale(scaled, 0, max, 1.15, 0), 2);

    if (master) {
      audioContext.setMasterGain(gain);
    } else {
      gainNode.gain.value = gain;
    }
  };

  const resetFader = () => {
    if (master) {
      audioContext.setMasterGain(1);
    } else {
      gainNode.gain.value = 1;
    }
    setPosition(-171);
  };

  const max = master ? 314 : 220;

  return (
    <Draggable
      axis="y"
      bounds="parent"
      position={{ x: 0, y: position }}
      onDrag={(e, data) => handleDrag(e, data, max)}
    >
      <div className="fader" onDoubleClick={resetFader}></div>
    </Draggable>
  );
};

export default Fader;
