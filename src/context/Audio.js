// audio node -> gain -> pan -> (analyser) -> master gain -> splitter -> (analyser) -> merger -> dest
import React, { useState, useEffect, useRef } from "react";
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

function createAsyncBufferSource(arrayBuffer) {
  return new Promise((resolve, reject) => {
    audioCtx.decodeAudioData(
      arrayBuffer,
      (buffer) => {
        resolve(buffer);
      },
      (e) => {
        e = reject;
      }
    );
  });
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
  const currentTime = useRef(0);
  const startedAt = useRef(0);
  const pausedAt = useRef(0);
  const [masterTrack, setMasterTrack] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [mutedTracks, setMutedTracks] = useState([]);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const masterNode = createMasterNode();
    loadAudio(masterNode);
  }, []);

  const setAndGetCurrentTime = () => {
    if (pausedAt) {
      currentTime.current = pausedAt;
      return pausedAt;
    }
    if (startedAt) {
      currentTime.current = audioCtx.currentTime - startedAt;
      return audioCtx.currentTime - startedAt;
    }
    return 0;
  };

  const exportAudio = () => {
    console.log("Exporting ...");
  };

  const record = () => {
    recorder.startTime = currentTime.current;
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
          const muteNode = audioCtx.createGain();
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
          newInputTrack.muteNode = muteNode;
          newInputTrack.pannerNode = pannerNode;
          newInputTrack.analyserNode = analyserNode;
          newInputTrack.solo = false;
          newInputTrack.mute = true;

          newInputTrack.muteNode.gain.value = 0;
          setMutedTracks([...mutedTracks, newInputTrack.id]);

          // Connecting the nodes and connecting it to the master gain node
          audioNode
            .connect(muteNode)
            .connect(gainNode)
            .connect(pannerNode)
            .connect(analyserNode)
            .connect(masterNode.gainNode);

          allNewTracks.push(newInputTrack);

          setTracks(allNewTracks); // TODO: convert this stuff into AWAIT and do it better ... e.g. fist load audio files, then load mic
          // Now if someone doesnt have mic, they can not just play back ...
          // setReload(!reload);
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

  const loadAudio = async (masterNode) => {
    const audioContainer = document.getElementById("audio-container");
    let newTracks = [];
    let count = 1;
    for (const track of config.tracks) {
      const progress = count / config.tracks.length;
      setLoadProgress(progress);
      count++;
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

      // console.log(audioElement);

      // Trying to use audio buffer instead of audio element
      const response = await fetch(`/sounds/${track.fileName}`);
      const audioArrayBuffer = await response.arrayBuffer();
      const decodedAudio = await createAsyncBufferSource(audioArrayBuffer);
      const bufferSource = audioCtx.createBufferSource();
      bufferSource.buffer = decodedAudio;

      // Creating audio, gain and panner nodes
      const audioNode = audioCtx.createMediaElementSource(audioElement);
      const gainNode = audioCtx.createGain();
      const muteNode = audioCtx.createGain();
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
      newTrack.decodedAudio = decodedAudio;
      newTrack.buffer = bufferSource;
      newTrack.type = "playback";
      newTrack.audioNode = audioNode;
      newTrack.gainNode = gainNode;
      newTrack.muteNode = muteNode;
      newTrack.pannerNode = pannerNode;
      newTrack.analyserNode = analyserNode;
      newTrack.solo = false;
      newTrack.mute = false;

      // Connecting the nodes and connecting it to the master gain node
      bufferSource
        .connect(muteNode)
        .connect(gainNode)
        .connect(pannerNode)
        .connect(analyserNode)
        .connect(masterNode.gainNode);

      newTracks.push(newTrack);
    }

    createInputNode(masterNode, newTracks);
  };

  const playBufferNode = (track, offset) => {
    const bufferSource = audioCtx.createBufferSource();
    bufferSource.buffer = track.decodedAudio;
    track.buffer = bufferSource;
    track.buffer.connect(track.muteNode);
    track.buffer.start(0, offset);
  };

  const togglePlayAll = () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    if (!playing) {
      const offset = pausedAt.current;

      tracks.forEach((track) => {
        if (track.type === "playback") {
          playBufferNode(track, offset);
        }
      });
      startedAt.current = audioCtx.currentTime - offset;
      pausedAt.current = 0;
      setPlaying(true);
    } else {
      const elapsed = audioCtx.currentTime - startedAt.current;
      tracks.forEach((track) => {
        if (track.type === "playback") {
          track.buffer.stop();
        }
      });
      pausedAt.current = elapsed;
      setPlaying(false);
    }
  };

  const rewind = () => {
    let newTime = currentTime.current - 5; // One second
    if (newTime <= 0) {
      newTime = 0;
    }
    tracks.forEach((track) => {
      if (track.type === "playback") {
        track.elem.currentTime = newTime;
      }
    });
    currentTime.current = newTime;
  };

  const forward = () => {
    let newTime = currentTime.current + 5; // One second
    const maxTime = tracks[0].elem.duration;
    if (newTime >= maxTime - 1) {
      newTime = maxTime - 1;
    }
    tracks.forEach((track) => {
      if (track.type === "playback") {
        track.elem.currentTime = newTime;
      }
    });
    currentTime.current = newTime;
  };

  const backToStart = () => {
    tracks.forEach((track) => {
      if (track.type === "playback") {
        track.elem.currentTime = 0;
      }
    });
    currentTime.current = 0;
  };

  const setMasterGain = (gain) => {
    masterTrack.gainNode.gain.value = gain;
  };

  const toggleSolo = (id, solo) => {
    if (solo) {
      tracks.forEach((track) => {
        if (track.id === id) {
          track.solo = true;
          return;
        }
        track.muteNode.gain.value = 0;
        track.solo = false;
        track.mute = true;
      });
    } else {
      tracks.forEach((track) => {
        // Keep muted tracks muted after un-solo
        if (mutedTracks.indexOf(track.id) !== -1) {
          return;
        } else {
          track.muteNode.gain.value = 1;
          track.solo = false;
        }
      });
    }
  };

  const toggleMute = (id, mute) => {
    // TODO: do this more efficently
    tracks.forEach((track) => {
      if (track.id === id) {
        if (mute) {
          track.muteNode.gain.value = 0;
          setMutedTracks([...mutedTracks, track.id]);
        }

        if (!mute) {
          track.muteNode.gain.value = 1;
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
        rewind,
        forward,
        exportAudio,
        record,
        recordStop,
        setAndGetCurrentTime,
      }}
    >
      {tracks && tracks.length > 0 ? (
        children
      ) : (
        <Loader progress={loadProgress} />
      )}
    </AudioContext.Provider>
  );
};

export default AudioContextProvider;
