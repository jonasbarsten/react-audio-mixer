import React, { useState, useEffect, useContext } from "react";
import config from "./config.json";

import "./fonts/digital-7.eot";
import "./fonts/digital-7.svg";
import "./fonts/digital-7.ttf";
import "./fonts/digital-7.woff";

import "./stylesheets/normalize.css";
import "./stylesheets/normalize-edit.css";
import "./stylesheets/fonts.css";
import "./stylesheets/loader.css";
import "./stylesheets/main.css";

import Mixer from "./components/Mixer";
import Controls from "./components/Controls";
import AudioAnalyser from "./components/AudioAnalyser";
import Loader from "./components/Loader";

import { AudioContext } from "./context/Audio";

const App = () => {
  const [audio, setAudio] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [audioCtx, setAudioCtx] = useState(null);
  // const [audioElements, setAudioElements] = useState(null);
  const audioContext = useContext(AudioContext);

  useEffect(() => {
    audioContext.init();

    // const onLoad = async () => {
    //   if (audioCtx) {
    //     return;
    //   }
    //   const AudioContext = window.AudioContext || window.webkitAudioContext;
    //   const newAudioCtx = new AudioContext();

    //   const audioContainer = document.getElementById("audio-container");

    //   console.log(audioContainer);

    //   let newAudioElements = [];

    //   config.tracks.map((track) => {
    //     // Creating audio element with audio source
    //     const src = config.audioRoot + track.fileName;
    //     const audioElement = document.createElement("AUDIO");
    //     audioContainer.appendChild(audioElement);
    //     newAudioElements.push(audioElement);
    //     audioElement.src = src;
    //     // Adding the audio element to the audio context
    //     const audioNode = newAudioCtx.createMediaElementSource(audioElement);
    //     // Connecting the track in the audio context to the audio context destination
    //     audioNode.connect(newAudioCtx.destination);
    //   });

    //   setAudioCtx(newAudioCtx);
    //   setAudioElements(newAudioElements);

    //   setIsLoading(false);
    // };

    // onLoad();
  }, []);

  ///// Microphone stuff /////

  const getMicrophone = async () => {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    setAudio(audio);
  };

  const stopMicrophone = () => {
    audio.getTracks().forEach((track) => track.stop());
    setAudio(null);
  };

  const toggleMicrophone = () => {
    if (audio) {
      stopMicrophone();
    } else {
      getMicrophone();
    }
  };

  // console.log(audio);
  // console.log(audioElements);

  ///// Microphone stuff /////

  return (
    <div className="App">
      <button onClick={toggleMicrophone}>
        {audio ? "Stop microphone" : "Get microphone input"}
      </button>
      {audio ? (
        <div
          style={{
            display: "grid",
            margin: "0",
            padding: "0",
            background: "#333e5a",
          }}
        >
          <div style={{ minHeight: "80vh", background: "#fff" }}>
            <AudioAnalyser audio={audio} />
          </div>
        </div>
      ) : (
        ""
      )}
      <header>
        <h1>Stokkmaur</h1>
      </header>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Mixer />
          <Controls />
        </>
      )}
      <div id="audio-container"></div>
    </div>
  );
};

export default App;
