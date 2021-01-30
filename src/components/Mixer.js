import React from "react";

import Channel from "./Channel";
import Track from "./Track";

const Mixer = () => {
  return (
    <div id="mixer">
      <Channel id={1} />
      <Channel id={2} />
      <Channel id={3} />
      <Channel id={4} />
      <Channel id={5} />
      <Channel id={6} />
      <Channel id={7} />
      <Channel id={8} />
      <Channel id={9} />
      <Channel id={10} />
      <Channel id={11} />
      <Channel id={12} />
      <div id="meters">
        <div className="vu">
          <div className="mask">
            <div
              className="needle left"
              style={{ WebkitTransform: "rotateZ(0deg)" }}
            ></div>
          </div>
          <p className="vu-label">L</p>
        </div>
        <div className="vu">
          <div className="mask">
            <div
              className="needle right"
              style={{ WebkitTransform: "rotateZ(0deg)" }}
            ></div>
          </div>
          <p className="vu-label">R</p>
        </div>
      </div>
      <div id="master">
        <Track master={true} />
        <p className="label">Master</p>
      </div>
    </div>
  );
};

export default Mixer;
