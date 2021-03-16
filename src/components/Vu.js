import React, { useContext, useState, useRef, useEffect } from "react";
import { AudioContext } from "../context/Audio";
import { dBFSCalc, scale } from "../utils";

const nodeMap = {
  left: "analyserNodeL",
  right: "analyserNodeR",
};

const Vu = ({ channel, playing }) => {
  const analyserNodeName = nodeMap[channel];
  const [deg, setDeg] = useState(0);
  const animationRef = useRef(null);
  const audioContext = useContext(AudioContext);
  const masterTrack = audioContext.getMasterTrack();
  const bufferLength = masterTrack[analyserNodeName].fftSize;
  const animationData = useRef(new Uint8Array(bufferLength));
  let vuData = [];

  const animate = () => {
    console.log("Animate!!");
    const len = animationData.current.length;
    let newDbfs = new Array(len);

    masterTrack[analyserNodeName].getByteTimeDomainData(animationData.current);

    for (let i = 0; i < len; ++i) {
      newDbfs[i] = (animationData.current[i] * 2) / 255 - 1;
    }

    // TODO: set to -192 if not playing, could not get playing state from context here, it was always false
    newDbfs = dBFSCalc(newDbfs);
    let newDeg = Math.max(-20, scale(newDbfs + 20, -20, 0, 0, 60));

    vuData.unshift(newDeg);

    if (vuData.length >= 18) {
      vuData.length = 18;
    }

    newDeg =
      vuData.reduce((sum, curr) => {
        return sum + curr;
      }, 0) / vuData.length;

    setDeg(newDeg);

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!playing) {
      cancelAnimationFrame(animationRef.current);
      setDeg(0);
      return;
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [playing]);

  return (
    <div className="vu">
      <div className="mask">
        <div
          className={`needle ${channel}`}
          style={{
            WebkitTransform: `rotate(${deg}deg)`,
            MozTransform: `rotate(${deg}deg)`,
            transform: `rotate(${deg}deg)`,
          }}
        ></div>
      </div>
      <p className="vu-label">{channel[0].toUpperCase()}</p>
    </div>
  );
};

export default Vu;
