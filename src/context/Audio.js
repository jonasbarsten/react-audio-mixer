import React, { useState } from "react";
import config from "../config.json";

const WindowAudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new WindowAudioContext();

export const AudioContext = React.createContext();

const AudioContextProvider = ({ children }) => {
  const [playing, setPlaying] = useState(false);
  const [audioElements, setAudioElements] = useState(null);

  const init = () => {
    const audioContainer = document.getElementById("audio-container");
    let newAudioElements = [];

    config.tracks.forEach((track) => {
      // Creating audio element with audio source
      const audioElement = document.createElement("AUDIO");
      audioElement.src = config.audioRoot + track.fileName;
      audioContainer.appendChild(audioElement);

      newAudioElements.push(audioElement);

      // Adding the audio element to the audio context
      const audioNode = audioCtx.createMediaElementSource(audioElement);
      // Connecting the track in the audio context to the audio context destination
      audioNode.connect(audioCtx.destination);
    });

    setAudioElements(newAudioElements);
  };

  const togglePlayAll = () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    if (!playing) {
      audioElements.forEach((el) => {
        el.play();
      });
      setPlaying(true);
    } else {
      audioElements.forEach((el) => {
        el.pause();
      });
      setPlaying(false);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        init,
        togglePlayAll,
        playing: () => playing,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export default AudioContextProvider;
