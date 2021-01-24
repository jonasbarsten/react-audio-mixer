import React from "react";
import Clock from "./Clock";

const Controls = () => {
  return (
    <div id="controls">
      <Clock seconds={340} />
      <div className="buttons">
        <button className="btn-cntrl start"></button>
        <button className="btn-cntrl rw"></button>
        <button className="btn-cntrl play {{playing}}"></button>
        <button className="btn-cntrl ff"></button>
      </div>
    </div>
  );
};

export default Controls;
