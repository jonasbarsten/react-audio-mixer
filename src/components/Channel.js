import React, { useState } from "react";

import Panner from "./Panner";
import Track from "./Track";

const Channel = (props) => {
  // const track = props.track;
  // const [mute, setMute] = useState(props.track.mute);
  // const [solo, setSolo] = useState(props.track.solo);
  const [reverb, setReverb] = useState(false);

  return (
    <div className="channel">
      <div>
        <button
          className={`btn mute ${props.track.mute ? "active" : ""}`}
          onClick={() => props.track.toggleMute(props.track.id)}
        >
          M
        </button>
        <button
          className={`btn solo ${props.track.solo ? "active" : ""}`}
          onClick={() => props.track.toggleSolo(props.track.id)}
        >
          S
        </button>
        <button
          className={`btn afl ${reverb ? "active" : ""}`}
          onClick={() => setReverb(!reverb)}
        >
          PFL
        </button>
        <Panner />
        <Track
          // dBFS={dBFS}
          gainNode={props.track.gainNode}
          // analyserNode={track.analyserNode}
          audioNode={props.track.audioNode}
        />
        <p className="label">{props.track.name}</p>
      </div>
    </div>
  );
};

export default Channel;
