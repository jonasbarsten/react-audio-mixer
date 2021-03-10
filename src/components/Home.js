import React, { useContext } from "react";

import { AudioContext } from "../context/Audio";

import Mixer from "./Mixer";
import Controls from "./Controls";

const Home = () => {
  const audioContext = useContext(AudioContext);
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
      <button onClick={() => audioContext.exportAudio()}>Export</button>
      <audio src={audioContext.audioURL()} controls></audio>
    </>
  );
};

export default Home;
