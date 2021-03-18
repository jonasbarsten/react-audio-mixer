import React, { useState, useEffect } from "react";
import Slider from "@appigram/react-rangeslider";

import "@appigram/react-rangeslider/lib/index.css";

const PannerSlider = (props) => {
  const [pan, setPan] = useState(0);

  useEffect(() => {
    if (props.pannerNode.pan) {
      props.pannerNode.pan.value = pan;
    } else {
      // Safari
      props.pannerNode.setPosition(pan, 0, 1 - Math.abs(pan));
      props.etc.panValue = pan;
    }
  }, [pan, props.pannerNode, props.etc]);

  const handlePanChange = (data) => {
    if (data < -1 || data > 1 || data === pan) {
      return;
    }
    // console.log(data);
    setPan(data);
  };
  return (
    <div>
      <Slider
        min={-1}
        max={1}
        step={0.1}
        tooltip={false}
        value={pan}
        orientation="horizontal"
        onChange={handlePanChange}
      />
    </div>
  );
};

export default PannerSlider;
