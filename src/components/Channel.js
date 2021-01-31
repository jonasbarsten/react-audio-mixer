import React, { useState } from "react";

import Panner from "./Panner";
import Track from "./Track";

const Channel = (props) => {
  const track = props.track;
  const [mute, setMute] = useState(false);
  const [solo, setSolo] = useState(false);
  const [reverb, setReverb] = useState(false);
  const [dBFS, setDBFS] = useState(-48);

  return (
    <div className="channel">
      <div>
        <button
          className={`btn mute ${mute ? "active" : ""}`}
          onClick={() => setMute(!mute)}
        >
          M
        </button>
        <button
          className={`btn solo ${solo ? "active" : ""}`}
          onClick={() => setSolo(!solo)}
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
          gainNode={track.gainNode}
          // analyserNode={track.analyserNode}
          audioNode={track.audioNode}
        />
        <p className="label">{props.track.name}</p>
      </div>
    </div>
  );
};

export default Channel;
