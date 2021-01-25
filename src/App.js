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

import Track from "./components/Track";
import Controls from "./components/Controls";
import AudioAnalyser from "./components/AudioAnalyser";

function App() {
  const [audio, setAudio] = useState(null);

  const getMicrophone = async () => {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    setAudio(audio);
    // this.setState({ audio });
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
      {/* <div id="loader">
        <div className="loader-bar"></div>
        <span>Loading Audio Assets...</span>
      </div> */}
      <div id="mixer">
        <Track id={1} />
        <Track id={2} />
        <Track id={3} />
        <Track id={4} />
        <Track id={5} />
        <Track id={6} />
        <Track id={7} />
        <Track id={8} />
        <Track id={9} />
        <Track id={10} />
        <Track id={11} />
        <Track id={12} />
        <div id="meters">
          <div className="vu">
            <div className="mask">
              <div
                className="needle left"
                style={{ WebkitTransform: "rotateZ(0deg)" }}
              ></div>
            </div>
            <p className="vu-label">L</p>
          </div>
          <div className="vu">
            <div className="mask">
              <div
                className="needle right"
                style={{ WebkitTransform: "rotateZ(0deg)" }}
              ></div>
            </div>
            <p className="vu-label">R</p>
          </div>
        </div>
        <div id="master">
          <div className="track">
            <div className="fader" style={{ top: "209px" }}></div>
          </div>
          <p className="label">Master</p>
        </div>
      </div>
      <Controls />
    </div>
  );
}

export default App;
