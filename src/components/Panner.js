import React, { useState, useEffect } from "react";

import { scale } from "../utils";

const Panner = (props) => {
  const [pan, setPan] = useState(0);
  const [pannerDeg, setPannerDeg] = useState(0);
  const [pannerCanDrag, setPannerCanDrag] = useState(false);
  const [dragState, setDragState] = useState({
    width: null,
    height: null,
    offset: { left: null, top: null },
    x: null,
    y: null,
  });

  useEffect(() => {
    props.pannerNode.pan.value = pan;
  }, [pan, props.pannerNode.pan]);

  const handleDrag = (e) => {
    if (!pannerCanDrag) {
      return;
    }

    const touch = e.type === "touchmove" && e.originalEvent.changedTouches;
    const top = touch && touch[0] ? touch[0].pageY : e.pageY;
    const left = touch && touch[0] ? touch[0].pageX : e.pageX;
    const a = dragState.offset.left + dragState.width / 2 - parseInt(left);
    const b = dragState.offset.top + dragState.height / 2 - parseInt(top);
    const deg = -1 * Math.atan2(a, b) * (180 / Math.PI);

    if (deg >= -150 && deg <= 150) {
      setPannerDeg(deg);
      setPan(scale(deg, -150, 150, -1, 1));
    }
  };

  const enableDrag = (e) => {
    let newDragState = {};
    const elem = e.target;
    setPannerCanDrag(true);
    newDragState.width = parseInt(elem.offsetWidth);
    newDragState.height = parseInt(elem.offsetHeight);
    newDragState.offset = {
      top: parseInt(elem.getBoundingClientRect().top),
      left: parseInt(elem.getBoundingClientRect().left),
    };
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
    if (pannerCanDrag) {
      setPannerCanDrag(false);
    }
  };

  const resetPanner = () => {
    setPannerDeg(0);
    setPan(0);
  };

  return (
    <div className="pan">
      <div
        className="panner"
        onMouseDown={enableDrag}
        onTouchStart={enableDrag}
        onDoubleClick={resetPanner}
        onMouseUp={disableDrag}
        onTouchEnd={disableDrag}
        onTouchCancel={disableDrag}
        // onMouseOut={disableDrag}
        onMouseMove={(e) => handleDrag(e)}
        style={{
          WebkitTransform: `rotate(${pannerDeg}deg)`,
          MozTransform: `rotate(${pannerDeg}deg)`,
          transform: `rotate(${pannerDeg}deg)`,
        }}
      >
        <div className="pan-indicator"></div>
      </div>
    </div>
  );
};

export default Panner;
