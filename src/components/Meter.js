import React, { useRef, useEffect, useContext } from "react";
import webAudioPeakMeter from "web-audio-peak-meter";

import { AudioContext } from "../context/Audio";

const Meter = (props) => {
  const audioContext = useContext(AudioContext);
  const meterRef = useRef(null);

  useEffect(() => {
    const audioCtx = audioContext.getAudioContext();
    const meterNode = webAudioPeakMeter.createMeterNode(
      props.gainNode,
      audioCtx
    );
    webAudioPeakMeter.createMeter(meterRef.current, meterNode, {});
  }, []);

  return (
    <>
      <div
        ref={meterRef}
        className="meter"
        height="280"
        style={{ width: "5em", height: "20em", marginLeft: "-45px" }}
      ></div>
    </>
  );
};

export default Meter;
