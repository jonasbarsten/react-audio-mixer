import React, { useRef, useEffect, useContext } from "react";
import webAudioPeakMeter from "web-audio-peak-meter";

import { AudioContext } from "../context/Audio";

import "./Meter.scss";

const Meter = ({ gainNode }) => {
  const audioContext = useContext(AudioContext);
  const meterRef = useRef(null);
  const audioCtx = audioContext.getAudioContext();

  useEffect(() => {
    const meterNode = webAudioPeakMeter.createMeterNode(gainNode, audioCtx);
    webAudioPeakMeter.createMeter(meterRef.current, meterNode, {});
  }, [audioCtx, gainNode]);

  return (
    <>
      <div ref={meterRef} className="meter" height="280"></div>
    </>
  );
};

export default Meter;
