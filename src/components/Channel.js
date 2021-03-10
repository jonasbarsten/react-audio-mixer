import React, { useState, useContext } from "react";

import { AudioContext } from "../context/Audio";

import Panner from "./Panner";
import Track from "./Track";

import "./Channel.scss";

const Channel = ({ track = {} }) => {
  const audioContext = useContext(AudioContext);
  const [recording, setRecording] = useState(false);
  const [mute, setMute] = useState(track.mute);
  const [solo, setSolo] = useState(track.solo);
  const [reverb, setReverb] = useState(false);

  const style = track.type === "input" ? { backgroundColor: "white" } : {};

  const toggleMute = () => {
    audioContext.toggleMute(track.id, !mute);
    setMute(!mute);
  };

  const toggleSolo = () => {
    audioContext.toggleSolo(track.id, !solo);
    setSolo(!solo);
  };

  const toggleRecording = () => {
    if (recording) {
      audioContext.recordStop(track);
      setRecording(false);
    } else {
      audioContext.recordStart(track);
      setRecording(true);
    }
  };

  const recordingClass = recording ? " recording" : " record";

  return (
    <div className="channel" style={style}>
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
        {track.type === "input" ? (
          <p className={`label${recordingClass}`} onClick={toggleRecording}>
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
