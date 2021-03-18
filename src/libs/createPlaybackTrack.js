import { v4 as uuidv4 } from "uuid";
import { createAsyncBufferSource } from "./audio";

const createPlaybackTrack = async (
  audioCtx,
  masterNode,
  song,
  data,
  type = "file",
  initFaderDownArray = []
) => {
  let newTrack = {
    id: uuidv4(),
    name: data.name,
    type: "playback",
    solo: false,
    mute: false,
    delay: false,
  };

  // Creating audio buffer source
  let audioArrayBuffer = null;
  if (type === "file") {
    const response = await fetch(`/sounds/${song}/${data.fileName}`);
    audioArrayBuffer = await response.arrayBuffer();
  }

  if (type === "buffer") {
    audioArrayBuffer = data.buffer;
  }

  const decodedAudio = await createAsyncBufferSource(
    audioCtx,
    audioArrayBuffer
  );

  // Creating audio, gain, analyser and panner nodes
  const gainNode = audioCtx.createGain();

  // Set with queryparam: ?initFaderDown=drums,bass,keys
  if (initFaderDownArray.includes(data.name)) {
    gainNode.gain.value = 0;
  }

  const muteNode = audioCtx.createGain();
  const convolverNode = audioCtx.createConvolver();
  const convolverResponse = await fetch("/sounds/effects/echo.wav");
  const convolverAudioArrayBuffer = await convolverResponse.arrayBuffer();
  const convolverDecodedAudio = await createAsyncBufferSource(
    audioCtx,
    convolverAudioArrayBuffer
  );
  convolverNode.buffer = convolverDecodedAudio;

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

  newTrack.decodedAudio = decodedAudio;
  newTrack.buffer = null; // Will be created on first play event
  newTrack.gainNode = gainNode;
  newTrack.muteNode = muteNode;
  newTrack.convolverNode = convolverNode;
  newTrack.pannerNode = pannerNode;
  newTrack.etc = { panValue: 0 };

  // Connecting the nodes and connecting it to the master gain node
  // The buffer node will be connected to the mute node on first play event
  muteNode.connect(gainNode).connect(pannerNode).connect(masterNode.gainNode);

  return newTrack;
};

export default createPlaybackTrack;
