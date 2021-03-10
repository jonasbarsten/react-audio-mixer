import React, { useContext, useEffect } from "react";

import Channel from "./Channel";
import Track from "./Track";
import Vu from "./Vu";

import { AudioContext } from "../context/Audio";

const Mixer = () => {
  const audioContext = useContext(AudioContext);
  const tracks = audioContext.getTracks();
  return (
    <div id="mixer">
      {tracks &&
        tracks.length > 0 &&
        tracks.map((track) => {
          return <Channel key={track.id} track={track} />;
        })}

      <div id="meters">
        <Vu channel="left" master={true} />
        <Vu channel="right" master={true} />
      </div>

      <div id="master">
        <Track master={true} />
        <p className="label">Master</p>
      </div>
    </div>
  );
};

export default Mixer;
