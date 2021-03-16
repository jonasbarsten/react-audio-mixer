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
  const [delay, setDelay] = useState(track.delay);

  const style = track.type === "input" ? { backgroundColor: "white" } : {};

  const toggleMute = () => {
    audioContext.toggleMute(track.id, !mute);
    setMute(!mute);
  };

  const toggleSolo = () => {
    audioContext.toggleSolo(track.id, !solo);
    setSolo(!solo);
  };

  const toggleDelay = () => {
    audioContext.toggleDelay(track, !delay);
    setDelay(!delay);
  };

  // const toggleRecording = () => {
  //   if (recording) {
  //     audioContext.recordStop(track);
  //     setRecording(false);
  //   } else {
  //     audioContext.recordStart(track);
  //     setRecording(true);
  //   }
  // };

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
          className={`btn afl ${delay ? "active" : ""}`}
          onClick={toggleDelay}
        >
          DELAY
        </button>
        <Panner pannerNode={track.pannerNode} etc={track.etc} />
        <Track
          gainNode={track.gainNode}
          // audioNode={track.audioNode}
          // analyserNode={track.analyserNode}
          meterValue={track.meterValue}
        />
        {track.type === "input" ? (
          <p className={`label${recordingClass}`}>Record</p>
        ) : (
          <p className="label">{track.name}</p>
        )}
      </div>
    </div>
  );
};

export default Channel;
