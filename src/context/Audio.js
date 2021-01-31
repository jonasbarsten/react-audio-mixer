// audio node -> gain -> pan -> (analyser) -> master gain -> splitter -> (analyser) -> merger -> dest

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import config from "../config.json";

import Loader from "../components/Loader";

const WindowAudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new WindowAudioContext();

export const AudioContext = React.createContext();

const AudioContextProvider = ({ children }) => {
  const [playing, setPlaying] = useState(false);
  const [tracks, setTracks] = useState(null);
  const [masterTrack, setMasterTrack] = useState(null);

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

  const loadAudio = (masterNode) => {
    const audioContainer = document.getElementById("audio-container");
    let newTracks = [];

    config.tracks.forEach((track) => {
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
      // const pannerOptions = { pan: 0 };
      // Not supported in Safari
      // const pannerNode = new StereoPannerNode(audioCtx, pannerOptions);
      // const pannerNode = audioCtx.createStereoPanner();
      const analyserNode = audioCtx.createAnalyser();

      newTrack.elem = audioElement;
      newTrack.audioNode = audioNode;
      newTrack.gainNode = gainNode;
      newTrack.pannerNode = pannerNode;
      newTrack.analyserNode = analyserNode;

      // Connecting the nodes and connecting it to the master gain node
      audioNode
        .connect(gainNode)
        .connect(pannerNode)
        .connect(analyserNode)
        .connect(masterNode.gainNode);

      newTracks.push(newTrack);
    });

    setTracks(newTracks);
  };

  useEffect(() => {
    const masterNode = createMasterNode();
    loadAudio(masterNode);
  }, []);

  const togglePlayAll = () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    if (!playing) {
      tracks.forEach((track) => {
        track.elem.play();
      });
      setPlaying(true);
    } else {
      tracks.forEach((track) => {
        track.elem.pause();
      });
      setPlaying(false);
    }
  };

  const setMasterGain = (gain) => {
    masterTrack.gainNode.gain.value = gain;
  };

  return (
    <AudioContext.Provider
      value={{
        togglePlayAll,
        playing: () => playing,
        getTracks: () => tracks,
        getMasterTrack: () => masterTrack,
        setMasterGain: (gain) => setMasterGain(gain),
        getAudioContext: () => audioCtx,
      }}
    >
      {tracks ? children : <Loader />}
    </AudioContext.Provider>
  );
};

export default AudioContextProvider;
