import React, { useContext, useState, useRef, useEffect } from "react";
import { AudioContext } from "../context/Audio";
import { dBFSCalc, scale } from "../utils";

// const nodeMap = {
//   left: "analyserNodeL",
//   right: "analyserNodeR",
// };

const MeterTest = ({ meterValue }) => {
  //   const analyserNodeName = nodeMap[props.channel];
  // const [peak, setPeak] = useState(10);
  // const animationRef = useRef(null);
  // const audioContext = useContext(AudioContext);
  // //   const masterTrack = audioContext.getMasterTrack();
  // const bufferLength = analyserNode.fftSize;
  // const animationData = useRef(new Uint8Array(bufferLength));
  // let vuData = [];

  // const animate = () => {
  //   const len = animationData.current.length;
  //   let newDbfs = new Array(len);

  //   analyserNode.getByteTimeDomainData(animationData.current);

  //   for (let i = 0; i < len; ++i) {
  //     newDbfs[i] = (animationData.current[i] * 2) / 255 - 1;
  //   }

  //   // TODO: set to -192 if not playing, could not get playing state from context here, it was always false
  //   newDbfs = dBFSCalc(newDbfs);
  //   let newPeak = Math.max(-20, scale(newDbfs + 20, -20, 0, 0, 60));

  //   vuData.unshift(newPeak);

  //   if (vuData.length >= 18) {
  //     vuData.length = 18;
  //   }

  //   newPeak =
  //     vuData.reduce((sum, curr) => {
  //       return sum + curr;
  //     }, 0) / vuData.length;

  //   newPeak = newPeak / 85;
  //   newPeak = newPeak + 0.23;

  //   if (newPeak < 0) {
  //     newPeak = 0;
  //   }

  //   if (newPeak > 1) {
  //     newPeak = 1;
  //   }
  //   // newPeak = newPeak - 1;

  //   setPeak(newPeak);

  //   animationRef.current = requestAnimationFrame(animate);
  // };

  // useEffect(() => {
  //   if (!audioContext.playing()) {
  //     if (animationRef.current) {
  //       cancelAnimationFrame(animationRef.current);
  //     }
  //     setPeak(0);
  //     return;
  //   }
  //   animationRef.current = requestAnimationFrame(animate);
  //   return () => cancelAnimationFrame(animationRef.current);
  // }, [audioContext]);

  return (
    <div
      style={{ backgroundColor: "green", height: `${290 * meterValue}px` }}
    ></div>
  );

  return <p>{peak}</p>;

  //   return (
  //     <div className="vu">
  //       <div className="mask">
  //         <div
  //           className={`needle ${props.channel}`}
  //           style={{
  //             WebkitTransform: `rotate(${deg}deg)`,
  //             MozTransform: `rotate(${deg}deg)`,
  //             transform: `rotate(${deg}deg)`,
  //           }}
  //         ></div>
  //       </div>
  //       <p className="vu-label">{props.channel[0].toUpperCase()}</p>
  //     </div>
  //   );
};

export default MeterTest;
