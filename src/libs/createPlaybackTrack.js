import { v4 as uuidv4 } from "uuid";
import { createAsyncBufferSource } from "./audio";

const createPlaybackTrack = async (audioCtx, masterNode, song, track) => {
  let newTrack = {
    id: uuidv4(),
    name: track.name,
    fileName: track.fileName,
    type: "playback",
    solo: false,
    mute: false,
    delay: false,
  };

  // Creating audio buffer source
  const response = await fetch(`/sounds/${song}/${track.fileName}`);
  const audioArrayBuffer = await response.arrayBuffer();
  const decodedAudio = await createAsyncBufferSource(
    audioCtx,
    audioArrayBuffer
  );
  const bufferSource = audioCtx.createBufferSource();
  bufferSource.buffer = decodedAudio;

  // Creating audio, gain, analyser and panner nodes
  const gainNode = audioCtx.createGain();
  const muteNode = audioCtx.createGain();
  // const analyserNode = audioCtx.createAnalyser();
  // const bufferLength = analyserNode.fftSize;
  // const animationData = new Uint8Array(bufferLength);
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
  newTrack.buffer = bufferSource;
  newTrack.gainNode = gainNode;
  newTrack.muteNode = muteNode;
  newTrack.convolverNode = convolverNode;
  newTrack.pannerNode = pannerNode;
  newTrack.etc = { panValue: 0 };
  // newTrack.analyserNode = analyserNode;
  // newTrack.animationData = animationData;
  // newTrack.meterData = [];
  // newTrack.meterValue = 0;

  // Connecting the nodes and connecting it to the master gain node
  bufferSource
    .connect(muteNode)
    .connect(gainNode)
    .connect(pannerNode)
    // .connect(convolverNode)
    // .connect(analyserNode)
    .connect(masterNode.gainNode);

  return newTrack;
};

export default createPlaybackTrack;
