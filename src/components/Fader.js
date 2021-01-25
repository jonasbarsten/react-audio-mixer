import React, { useState } from "react";

import { scale } from "../utils";

const Fader = (props) => {
  const [gain, setGain] = useState(1);
  const [faderCanDrag, setFaderCanDrag] = useState(false);
  const [dragState, setDragState] = useState({
    x: null,
    y: null,
    px: 28.7, // Gain: 1
    prop: null,
  });
  const [faderStyle, setFaderStyle] = useState({ top: `${dragState.px}px` });

  const handleDrag = (e, max) => {
    if (!faderCanDrag) {
      return;
    }
    const touch = e.type === "touchmove" && e.originalEvent.changedTouches;
    const pos = touch && touch[0] ? touch[0].pageY : e.pageY;
    const state = dragState.y;
    const delta = pos - state;
    let css = dragState.px + delta;
    css = Math.min(max, css);
    css = Math.max(0, css);
    setFaderStyle({ top: `${css}px` });
    setGain(Math.pow(scale(css, 0, 220, 1.15, 0), 2));
  };

  const enableDrag = (e) => {
    let newDragState = {};
    const elem = e.target;
    setFaderCanDrag(true);
    newDragState.px = parseInt(elem.style.top, 10);
    if (e.type === "touchstart" && e.originalEvent.changedTouches) {
      const touch = e.originalEvent.changedTouches[0];
      newDragState.x = touch.pageX;
      newDragState.y = touch.pageY;
    } else {
      newDragState.x = e.pageX;
      newDragState.y = e.pageY;
    }
    setDragState(newDragState);
  };

  const disableDrag = () => {
    if (faderCanDrag) {
      setFaderCanDrag(false);
    }
  };

  const resetFader = () => {
    const top = scale(1, 0, 1.15, 220, 0);
    setGain(1);
    setFaderStyle({ top: `${top}px` });
  };

  const max = props.master ? 315 : 220;

  return (
    <div
      className="fader"
      style={faderStyle}
      onMouseDown={enableDrag}
      onTouchStart={enableDrag}
      onDoubleClick={resetFader}
      onMouseUp={disableDrag}
      onTouchEnd={disableDrag}
      onTouchCancel={disableDrag}
      onMouseOut={disableDrag}
      onMouseMove={(e) => handleDrag(e, max)}
    ></div>
  );
};

export default Fader;
