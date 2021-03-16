import React, { useContext } from "react";

import Channel from "./Channel";
import Track from "./Track";
import Vu from "./Vu";

import { AudioContext } from "../context/Audio";

import "./Mixer.scss";

const Mixer = () => {
  const audioContext = useContext(AudioContext);
  const tracks = audioContext.getTracks();
  const playing = audioContext.playing();
  return (
    <div id="mixer">
      {tracks &&
        tracks.length > 0 &&
        tracks.map((track) => {
          return <Channel key={track.id} track={track} />;
        })}

      <div id="meters">
        <Vu channel="left" master={true} playing={playing} />
        <Vu channel="right" master={true} playing={playing} />
      </div>

      <div id="master">
        <Track master={true} />
        <p className="label">Master</p>
      </div>
    </div>
  );
};

export default Mixer;
