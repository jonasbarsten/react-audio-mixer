import React, { useState, useContext } from "react";

import { AudioContext } from "../context/Audio";

import Panner from "./Panner";
import Track from "./Track";

const Channel = ({ track = {}, type = "playback" }) => {
  const audioContext = useContext(AudioContext);
  const [mute, setMute] = useState(track.mute);
  const [solo, setSolo] = useState(track.solo);
  const [reverb, setReverb] = useState(false);

  const toggleMute = () => {
    audioContext.toggleMute(track.id, !mute);
    setMute(!mute);
  };

  const toggleSolo = () => {
    audioContext.toggleSolo(track.id, !solo);
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
        <Panner pannerNode={track.pannerNode} />
        <Track gainNode={track.gainNode} audioNode={track.audioNode} />
        {type === "input" ? (
          <p className="label" style={{ color: "red" }}>
            Record
          </p>
        ) : (
          <p className="label">{track.name}</p>
        )}
      </div>
    </div>
  );
};

export default Channel;
