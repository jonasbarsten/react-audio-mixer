import React, { useRef, useEffect } from "react";
import { formatTime } from "../utils";

import "./Clock.scss";

const Clock = (props) => {
  const canvasRef = useRef(null);

  const updatePosition = (seconds) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = seconds;
    const str = formatTime(pos);
    const ghost = ["8", "8", ":", "8", "8", ":", "8", "8"];
    const arr = str.split("");
    let i = 0;
    let x = 78;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '76px "digital-7"';
    ctx.textAlign = "right";
    // draw ghost 7-segment
    // faster to loop twice than to keep changing fillStyle
    ctx.fillStyle = "hsla(215, 77%, 76%, 0.085)";
    while (i < 8) {
      ctx.fillText(ghost[i], x, 88);
      x += ghost[++i] === ":" ? 20 : 40;
    }
    i = 0;
    x = 78;
    // draw actual position
    ctx.fillStyle = "hsl(215, 77%, 76%)";
    while (i < 8) {
      ctx.fillText(arr[i], x, 88);
      x += arr[++i] === ":" ? 20 : 40;
    }
  };

  useEffect(() => {
    updatePosition(props.seconds);
  }, [props.seconds]);

  // Ugly hack to reload when the font has loaded
  useEffect(() => {
    setTimeout(() => {
      updatePosition(0);
    }, 100);
  }, []);

  return (
    <canvas ref={canvasRef} className="clock" width="360" height="120"></canvas>
  );
};

export default Clock;
