import React, { useRef, useEffect, useState } from "react";
import { scale } from "../utils";

const Meter = (props) => {
  const meterRef = useRef(null);
  const offScreenCanvasRef = useRef(null);

  const [dirty, setDirty] = useState(false);
  const [peakTime, setPeakTime] = useState(Number.NEGATIVE_INFINITY);
  const [peak, setPeak] = useState(0);

  useEffect(() => {
    const canvas = meterRef.current;
    const height = canvas.height;
    const width = canvas.width;
    let hue = 180;
    let i = 0;

    const offscreenCanvas = offScreenCanvasRef.current;
    offscreenCanvas.setAttribute("ref", offScreenCanvasRef);
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const offscreenCanvasCtx = offscreenCanvas.getContext("2d");
    offscreenCanvasCtx.fillStyle = "hsl(" + hue + ", 100%, 40%)";
    while (i < height) {
      hue += (1 - i / height) * 0.6;
      offscreenCanvasCtx.fillStyle = "hsl(" + hue + ", 100%, 40%)";
      offscreenCanvasCtx.fillRect(0, height - i, width, 2);
      i += 3;
    }
  }, []);

  useEffect(() => {
    const drawMeter = () => {
      const canvas = meterRef.current;

      if (typeof canvas !== "object") {
        return;
      }

      const height = canvas.height;
      const width = canvas.width;
      const ctx = canvas.getContext("2d");

      let scaled = scale(-props.dBFS, 48, 0, 0, height);
      const now = Date.now();
      let timeDiff = now - peakTime;
      let freshness;
      // if (afl) {
      //   scaled = scaled * gain;
      // }
      scaled = Math.max(0, scaled - (scaled % 3));
      if (dirty) {
        ctx.clearRect(0, 0, width, height);
        setDirty(false);
      }
      if (scaled >= 3) {
        const offscreenCanvas = offScreenCanvasRef.current;
        ctx.drawImage(
          offscreenCanvas,
          0,
          height - scaled,
          width,
          scaled,
          0,
          height - scaled,
          width,
          scaled
        );
        setDirty(true);
      }
      // save new peak
      if (scaled >= peak) {
        setPeak(scaled);
        setPeakTime(now);
        timeDiff = 0;
      }
      // draw existing peak
      if (timeDiff < 1000 && peak >= 1) {
        // for first 650 ms, use full alpha, then fade out
        freshness = timeDiff < 650 ? 1 : 1 - (timeDiff - 650) / 350;
        ctx.fillStyle = "rgba(238,119,85," + freshness + ")";
        ctx.fillRect(0, height - peak - 1, width, 1);
        setDirty(true);
        // clear peak
      } else {
        setPeak(0);
        setPeakTime(now);
      }
      // console.log("Boom");
      // }
    };
    drawMeter();
  }, [props.dBFS]);

  return (
    <>
      <canvas ref={meterRef} className="meter" width="8" height="280"></canvas>
      <canvas ref={offScreenCanvasRef}></canvas>
    </>
  );
};

export default Meter;
