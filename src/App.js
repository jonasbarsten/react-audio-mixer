import React, { useState } from "react";

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

function App() {
  const [audio, setAudio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  console.log(audio);

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
    </div>
  );
}

export default App;
