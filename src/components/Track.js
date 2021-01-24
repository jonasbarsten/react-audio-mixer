import React from "react";

const Track = () => {
  return (
    <div className="channel">
      <div>
        <button className="btn mute {{muted}}">M</button>
        <button className="btn solo {{soloed}}">S</button>
        <button className="btn afl {{afl}}">PFL</button>
        <div className="pan">
          <div
            className="panner"
            style={{
              WebkitTransform: "rotate({{pan}}deg)",
              MozTransform: "rotate({{pan}}deg)",
            }}
          >
            <div className="pan-indicator"></div>
          </div>
        </div>
        <div className="track">
          <canvas className="meter" width="8" height="280"></canvas>
          <div className="fader" style={{ top: "{{gain}}px" }}></div>
        </div>
        <p className="label">Fisk</p>
      </div>
    </div>
  );
};

export default Track;
