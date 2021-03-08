// audio node -> gain -> pan -> (analyser) -> master gain -> splitter -> (analyser) -> merger -> dest
import React, { useState, useEffect } from "react";
import Recorder from "recorder-js";
import { v4 as uuidv4 } from "uuid";
import config from "../config.json";

import Loader from "../components/Loader";

let audioCtx = null;
let recorder = null;

try {
  window.AudioContext =
    window.AudioContext ||
    window.webkitAudioContext ||
    window.mozAudioContext ||
    window.msAudioContext;
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
  audioCtx = new window.AudioContext();
  // me.context.createGain = me.context.createGain || me.context.createGainNode;
} catch (e) {
  window.alert("Your browser does not support WebAudio, try Google Chrome");
}

// if recording is supported then load Recorder.js
// if (navigator.getUserMedia) {
//   navigator.getUserMedia(
//     { audio: true },
//     function (stream) {
//       console.log("Boom");
//       // const input = audioCtx.createMediaStreamSource(stream);
//       recorder = new Recorder(audioCtx);
//       recorder.init(stream);
//     },
//     function (e) {
//       window.alert("Please enable your microphone to begin recording");
//     }
//   );
// } else {
//   window.alert("Your browser does not support recording, try Google Chrome");
// }

export const AudioContext = React.createContext();

const AudioContextProvider = ({ children }) => {
  const [playing, setPlaying] = useState(false);
  const [tracks, setTracks] = useState(null);
  const [masterTrack, setMasterTrack] = useState(null);
  // const [inputTrack, setInputTrack] = useState(null);
  const [mutedTracks, setMutedTracks] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const masterNode = createMasterNode();
    loadAudio(masterNode);
    // // const inputTracks = createInputNode(masterNode);
    // createInputNode(masterNode);
    // setTracks(playBackTracks);
  }, []);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const interval = setInterval(() => {
      const newCurrentTime = tracks[0].elem.currentTime;
      setCurrentTime(newCurrentTime);
    }, 100);

    return () => clearInterval(interval);
  }, [playing, tracks]);

  const exportAudio = () => {
    console.log("Exporting ...");
  };

  const record = () => {
    recorder.startTime = currentTime;
    recorder.start();
  };

  const recordStop = () => {
    recorder.stop().then(({ blob }) => {
      Recorder.download(blob, "my-audio-file");
    });
  };

  const createMasterNode = () => {
    const gainNode = audioCtx.createGain();
    const splitterNode = audioCtx.createChannelSplitter(2);
    const mergerNode = audioCtx.createChannelMerger(2);
    const analyserNodeL = audioCtx.createAnalyser();
    const analyserNodeR = audioCtx.createAnalyser();

    analyserNodeL.smoothingTimeConstant = 1;
    analyserNodeR.smoothingTimeConstant = 1;
    analyserNodeL.fftSize = 2048;
    analyserNodeR.fftSize = 2048;

    const dataArrayL = new Uint8Array(analyserNodeL.frequencyBinCount);

    // Connecting the cables
    gainNode.connect(splitterNode);
    splitterNode.connect(analyserNodeL, 0, 0);
    splitterNode.connect(analyserNodeR, 1, 0);
    splitterNode.connect(mergerNode, 0, 0);
    splitterNode.connect(mergerNode, 1, 1);
    mergerNode.connect(audioCtx.destination);

    // Save in state
    const masterNode = {
      gainNode,
      splitterNode,
      mergerNode,
      analyserNodeL,
      analyserNodeR,
      dataArrayL,
      dbfsL: 0,
      dbfsR: 0,
    };

    setMasterTrack(masterNode);
    return masterNode;
  };

  const createInputNode = async (masterNode, newTracks) => {
    let allNewTracks = newTracks;
    if (navigator.mediaDevices) {
      console.log("getUserMedia supported.");
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          let newInputTrack = {};
          // Creating audio, gain and panner nodes
          const audioNode = audioCtx.createMediaStreamSource(stream);
          const gainNode = audioCtx.createGain();
          let pannerNode;

          // Support for Safari and iOS
          if (audioCtx.createStereoPanner) {
            pannerNode = audioCtx.createStereoPanner();
            pannerNode.pan.value = 0;
          } else {
            pannerNode = audioCtx.createPanner();
            pannerNode.panningModel = "equalpower";
            pannerNode.setPosition(0, 0, 1 - Math.abs(0));
          }

          const analyserNode = audioCtx.createAnalyser();

          // newInputTrack.elem = audioElement;
          newInputTrack.id = uuidv4();
          newInputTrack.type = "input";
          newInputTrack.audioNode = audioNode;
          newInputTrack.gainNode = gainNode;
          newInputTrack.pannerNode = pannerNode;
          newInputTrack.analyserNode = analyserNode;
          newInputTrack.solo = false;
          newInputTrack.mute = false;

          // Connecting the nodes and connecting it to the master gain node
          audioNode
            .connect(gainNode)
            .connect(pannerNode)
            .connect(analyserNode)
            .connect(masterNode.gainNode);

          allNewTracks.push(newInputTrack);

          setTracks(allNewTracks); // TODO: convert this stuff into AWAIT and do it better ... e.g. fist load audio files, then load mic
          // Now if someone doesnt have mic, they can not just play back ...
        })
        .catch((e) => {
          window.alert("The following gUM error occurred: " + e);
        });
    } else {
      window.alert(
        "Your browser does not support recording, try Google Chrome"
      );
    }
  };

  const loadAudio = (masterNode) => {
    const audioContainer = document.getElementById("audio-container");
    let newTracks = [];

    config.tracks.forEach((track) => {
      if (!track) {
        return;
      }
      let newTrack = {
        id: uuidv4(),
        name: track.name,
        fileName: track.fileName,
      };
      // Creating audio element in the DOM with an audio source
      const audioElement = document.createElement("AUDIO");
      audioElement.src = config.audioRoot + track.fileName;
      audioContainer.appendChild(audioElement);

      // Creating audio, gain and panner nodes
      const audioNode = audioCtx.createMediaElementSource(audioElement);
      const gainNode = audioCtx.createGain();
      let pannerNode;

      // Support for Safari and iOS
      if (audioCtx.createStereoPanner) {
        pannerNode = audioCtx.createStereoPanner();
        pannerNode.pan.value = 0;
      } else {
        pannerNode = audioCtx.createPanner();
        pannerNode.panningModel = "equalpower";
        pannerNode.setPosition(0, 0, 1 - Math.abs(0));
      }

      const analyserNode = audioCtx.createAnalyser();

      newTrack.elem = audioElement;
      newTrack.type = "playback";
      newTrack.audioNode = audioNode;
      newTrack.gainNode = gainNode;
      newTrack.pannerNode = pannerNode;
      newTrack.analyserNode = analyserNode;
      newTrack.solo = false;
      newTrack.mute = false;

      // Connecting the nodes and connecting it to the master gain node
      audioNode
        .connect(gainNode)
        .connect(pannerNode)
        .connect(analyserNode)
        .connect(masterNode.gainNode);

      newTracks.push(newTrack);
    });

    createInputNode(masterNode, newTracks);
  };

  const togglePlayAll = () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    if (!playing) {
      tracks.forEach((track) => {
        if (track.type === "playback") {
          track.elem.play();
        }
      });
      setPlaying(true);
    } else {
      tracks.forEach((track) => {
        if (track.type === "playback") {
          track.elem.pause();
        }
      });
      setPlaying(false);
    }
  };

  const rewind = () => {
    let newTime = currentTime - 5; // One second
    if (newTime <= 0) {
      newTime = 0;
    }
    tracks.forEach((track) => {
      if (track.type === "playback") {
        track.elem.currentTime = newTime;
      }
    });
    setCurrentTime(newTime);
  };

  const forward = () => {
    let newTime = currentTime + 5; // One second
    const maxTime = tracks[0].elem.duration;
    if (newTime >= maxTime - 1) {
      newTime = maxTime - 1;
    }
    tracks.forEach((track) => {
      if (track.type === "playback") {
        track.elem.currentTime = newTime;
      }
    });
    setCurrentTime(newTime);
  };

  const backToStart = () => {
    tracks.forEach((track) => {
      if (track.type === "playback") {
        track.elem.currentTime = 0;
      }
    });
    setCurrentTime(0);
  };

  const setMasterGain = (gain) => {
    masterTrack.gainNode.gain.value = gain;
  };

  const toggleSolo = (id, solo) => {
    if (solo) {
      tracks.forEach((track) => {
        if (track.id === id) {
          return;
        }
        track.gainNode.gain.value = 0;
      });
    } else {
      tracks.forEach((track) => {
        // Keep muted tracks muted after un-solo
        if (mutedTracks.indexOf(track.id) !== -1) {
          return;
        } else {
          track.gainNode.gain.value = 1;
        }
      });
    }
  };

  const toggleMute = (id, mute) => {
    // TODO: do this more efficently
    tracks.forEach((track) => {
      if (track.id === id) {
        if (mute) {
          track.gainNode.gain.value = 0;
          setMutedTracks([...mutedTracks, track.id]);
        }

        if (!mute) {
          track.gainNode.gain.value = 1;
          const newMutedTracks = [...mutedTracks].filter((trackId) => {
            return trackId !== id;
          });
          setMutedTracks(newMutedTracks);
        }
      }
    });
  };

  return (
    <AudioContext.Provider
      value={{
        togglePlayAll,
        playing: () => playing,
        getTracks: () => tracks,
        getMasterTrack: () => masterTrack,
        setMasterGain,
        getAudioContext: () => audioCtx,
        toggleSolo,
        toggleMute,
        backToStart,
        getCurrentTime: () => currentTime,
        setCurrentTime: (time) => setCurrentTime(time),
        rewind,
        forward,
        exportAudio,
        record,
        recordStop,
        // getInputTrack: () => inputTrack,
      }}
    >
      {tracks ? children : <Loader />}
    </AudioContext.Provider>
  );
};

export default AudioContextProvider;
