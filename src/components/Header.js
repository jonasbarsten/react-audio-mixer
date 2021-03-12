import React, { useContext } from "react";
import { AudioContext } from "../context/Audio";

const Header = () => {
  const audioContext = useContext(AudioContext);
  console.log("Booooooom");
  return (
    <header>
      <h1>{audioContext.song().toUpperCase()}</h1>
    </header>
  );
};

export default Header;
