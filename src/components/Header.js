import React, { useContext } from "react";
import { AudioContext } from "../context/Audio";

const Header = () => {
  const audioContext = useContext(AudioContext);
  const song = audioContext.song();
  const songName = song === "stokkmaur" ? "stakkars stokkmaur" : song;

  return (
    <header>
      <h1>{songName.toUpperCase()}</h1>
    </header>
  );
};

export default Header;
