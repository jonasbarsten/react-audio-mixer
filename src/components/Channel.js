import React, { useState, useContext } from "react";

import { AudioContext } from "../context/Audio";

import Panner from "./Panner";
import Track from "./Track";

const Channel = (props) => {
  const audioContext = useContext(AudioContext);
  const [mute, setMute] = useState(props.track.mute);
  const [solo, setSolo] = useState(props.track.solo);
  const [reverb, setReverb] = useState(false);

  const toggleMute = () => {
    audioContext.toggleMute(props.track.id, !mute);
    setMute(!mute);
  };

  const toggleSolo = () => {
    audioContext.toggleSolo(props.track.id, !solo);
    setSolo(!solo);
  };

  return (
    <div className="channel">
      <div>
        <button
          className={`btn mute ${mute ? "active" : ""}`}
          onClick={toggleMute}
        >
          M
        </button>
        <button
          className={`btn solo ${solo ? "active" : ""}`}
          onClick={toggleSolo}
        >
          S
        </button>
        <button
          className={`btn afl ${reverb ? "active" : ""}`}
          onClick={() => setReverb(!reverb)}
        >
          REV
        </button>
        <Panner pannerNode={props.track.pannerNode} />
        <Track
          gainNode={props.track.gainNode}
          audioNode={props.track.audioNode}
        />
        <p className="label">{props.track.name}</p>
      </div>
    </div>
  );
};

export default Channel;
