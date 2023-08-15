import React, { useContext } from "react";
import { AudioContext } from "../context/Audio";

const Header = () => {
  const audioContext = useContext(AudioContext);
  const song = audioContext.song();

  let songName = song;

  if (song === "stokkmaur") {
    songName = "stakkars stokkmaur";
  }

  if (song === "stokkmaurEng") {
    songName = "poor carpenter ant";
  }
  return (
    <header>
      <h1>{songName.toUpperCase()}</h1>
    </header>
  );
};

export default Header;
