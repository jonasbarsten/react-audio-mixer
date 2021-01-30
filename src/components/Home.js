import React from "react";

import Mixer from "./Mixer";
import Controls from "./Controls";

import { AudioContext } from "../context/Audio";

const Home = () => {
  // useEffect(() => {
  //   audioContext.loadAudio();
  // }, []);

  ///// Microphone stuff /////

  // const getMicrophone = async () => {
  //   const audio = await navigator.mediaDevices.getUserMedia({
  //     audio: true,
  //     video: false,
  //   });
  //   setAudio(audio);
  // };

  // const stopMicrophone = () => {
  //   audio.getTracks().forEach((track) => track.stop());
  //   setAudio(null);
  // };

  // const toggleMicrophone = () => {
  //   if (audio) {
  //     stopMicrophone();
  //   } else {
  //     getMicrophone();
  //   }
  // };

  ///// Microphone stuff /////

  return (
    <>
      {/* <button onClick={toggleMicrophone}>
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
      )} */}

      <Mixer />
      <Controls />
    </>
  );
};

export default Home;
