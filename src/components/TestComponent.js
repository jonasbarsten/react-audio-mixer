import React, { useContext, useRef, useEffect } from "react";

import { AudioContext } from "../context/Audio";

const TestComponent = () => {
  const audioContext = useContext(AudioContext);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const masterTrack = audioContext.getMasterTrack();
  const bufferLength = masterTrack.analyserNodeL.fftSize;
  const animationData = useRef(new Uint8Array(bufferLength));

  // TODO: start / stop animation with audio start / stop if that is necessary for performance
  const animate = () => {
    const width = 200;
    const height = 200;
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");

    masterTrack.analyserNodeL.getByteTimeDomainData(animationData.current);

    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, width, height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";

    const sliceWidth = (width * 1.0) / bufferLength;
    let x = 0;

    canvasCtx.beginPath();
    for (var i = 0; i < bufferLength; i++) {
      const v = animationData.current[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) canvasCtx.moveTo(x, y);
      else canvasCtx.lineTo(x, y);

      x += sliceWidth;
    }

    canvasCtx.lineTo(width, height / 2);
    canvasCtx.stroke();
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return (
    <div style={{ color: "white" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default TestComponent;
