import React, { useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";

import { scale } from "../utils";

const Track = (props) => {
  const meterRef = useRef(null);
  const offScreenCanvasRef = useRef(null);
  const [name, setName] = useState("Track");
  const [gain, setGain] = useState(1);
  const [pan, setPan] = useState(0);
  const [mute, setMute] = useState(false);
  const [solo, setSolo] = useState(false);
  const [dBFS, setDBFS] = useState(-48);
  const [afl, setAfl] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [peakTime, setPeakTime] = useState(Number.NEGATIVE_INFINITY);
  const [peak, setPeak] = useState(0);

  const serializeData = () => {
    let data = {};
    data.gain = scale(Math.sqrt(gain), 0, 1.15, 220, 0);
    data.pan = scale(pan, -1, 1, -150, 150);
    data.mute = mute ? "active" : "";
    data.solo = solo ? "active" : "";
    data.afl = afl ? "" : "active";
    return data;
  };

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
    // setDBFS(-48);
    const drawMeter = () => {
      const canvas = meterRef.current;

      if (typeof canvas !== "object") {
        return;
      }

      const height = canvas.height;
      const width = canvas.width;
      const ctx = canvas.getContext("2d");

      let scaled = scale(-dBFS, 48, 0, 0, height);
      const now = Date.now();
      let timeDiff = now - peakTime;
      let freshness;
      if (afl) {
        scaled = scaled * gain;
      }
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
  }, [dBFS, afl]);

  const handleDrag = (e, max) => {
    if (e.pageY >= 513 || e.pageY <= 296) {
      return;
    }
    const position = e.layerY;
    let value = Math.min(max, position);
    value = Math.max(0, position);
    setGain(Math.pow(scale(value, 0, 217, 1.15, 0), 2));
  };

  const data = serializeData();

  return (
    <div className="channel">
      <div>
        <button
          className={`btn mute ${data.mute}`}
          onClick={() => setMute(!mute)}
        >
          M
        </button>
        <button
          className={`btn solo ${data.solo}`}
          onClick={() => setSolo(!solo)}
        >
          S
        </button>
        <button className={`btn afl ${data.afl}`} onClick={() => setAfl(!afl)}>
          PFL
        </button>
        <div className="pan">
          <div
            className="panner"
            style={{
              WebkitTransform: `rotate(${data.pan}deg)`,
              MozTransform: `rotate(${data.pan}deg)`,
            }}
          >
            <div className="pan-indicator"></div>
          </div>
        </div>
        <div className="track">
          <canvas
            ref={meterRef}
            className="meter"
            width="8"
            height="280"
          ></canvas>
          <canvas ref={offScreenCanvasRef}></canvas>
          <Draggable
            axis="y"
            bounds="parent"
            onDrag={(e) => handleDrag(e, 217)}
            // defaultPosition={{ y: 28 }}
          >
            <div className="fader" style={{ top: "28.7px" }}></div>
          </Draggable>
        </div>
        <p className="label">{name}</p>
      </div>
    </div>
  );
};

export default Track;
