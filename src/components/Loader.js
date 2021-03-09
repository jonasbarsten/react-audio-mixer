import React from "react";

const Loader = ({ progress }) => {
  const percent = Math.min(progress * 100, 100);
  return (
    <div id="loader">
      <div className="loader-bar" style={{ width: `${percent}%` }}></div>
      <span>Loading Audio Assets...</span>
    </div>
  );
};

export default Loader;
