import React, { useContext } from "react";
import { AudioContext } from "../context/Audio";

const Vu = () => {
  const audioContext = useContext(AudioContext);

  const masterLevels = audioContext.getMasterLevels();

  console.log(masterLevels);

  return (
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
  );
};

export default Vu;
