// audio node -> gain -> pan -> (analyser) -> master gain -> splitter -> (analyser) -> merger -> dest

import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { dBFSCalc } from "../utils";
import config from "../config.json";

import Loader from "../components/Loader";

const WindowAudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new WindowAudioContext();
const fftSize = 2048;
const timeData = new Uint8Array(fftSize);

export const AudioContext = React.createContext();

const AudioContextProvider = ({ children }) => {
  const [playing, setPlaying] = useState(false);
  const [tracks, setTracks] = useState(null);
  const [masterTrack, setMasterTrack] = useState(null);
  const [masterDbfsL, setMasterDbfsL] = useState(0);
  const [rafId, setRRafId] = useState(null);
  const [audioData, setAudioData] = useState(new Uint8Array(0));

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
      const pannerOptions = { pan: 0 };
      const pannerNode = new StereoPannerNode(audioCtx, pannerOptions);
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

  const tick = () => {
    if (!masterTrack) {
      return;
    }
    masterTrack.analyserNodeL.getByteTimeDomainData(masterTrack.dataArrayL);
    setAudioData(masterTrack.dataArrayL);
    setRRafId(requestAnimationFrame(tick));
  };

  useEffect(() => {
    const masterNode = createMasterNode();
    loadAudio(masterNode);
    setRRafId(requestAnimationFrame(tick));
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

  const getMasterLevels = () => {
    return { l: 123, r: 456 };
  };

  const levels = () => {
    console.log("booooom");
    if (!masterTrack) {
      return;
    }
    console.log(masterTrack.analyserNodeL);
    const len = timeData.length;
    let floats = new Array(len);
    masterTrack.analyserNodeL.getByteTimeDomainData(timeData);
    for (let i = 0; i < len; ++i) {
      floats[i] = (timeData[i] * 2) / 255 - 1;
    }
    const dBFS = playing ? dBFSCalc(floats) : masterDbfsL - 0.8;
    setMasterDbfsL(dBFS);
  };

  console.log(audioData);

  return (
    <AudioContext.Provider
      value={{
        togglePlayAll,
        playing: () => playing,
        getTracks: () => tracks,
        setMasterGain: (gain) => setMasterGain(gain),
        getMasterLevels,
      }}
    >
      {tracks ? children : <Loader />}
    </AudioContext.Provider>
  );
};

export default AudioContextProvider;
