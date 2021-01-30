import React, { useState } from "react";
import Draggable from "react-draggable";

import { scale } from "../utils";

const Fader = (props) => {
  const [gain, setGain] = useState(1);
  const [position, setPosition] = useState(-171);

  const handleDrag = (e, data, max) => {
    setPosition(data.y);
    const scaled = data.y + 200;
    setGain(Math.pow(scale(scaled, 0, max, 1.15, 0), 2));
  };

  const resetFader = () => {
    setGain(1);
    setPosition(-171);
  };

  const max = props.master ? 314 : 220;

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
