// buffer source -> mute -> gain -> pan -> (track analyser) -> master gain -> splitter -> (master analyser x 2 VU) -> merger -> dest
// TODO: export could be done in parallel with mixing ...

import React, { useState, useEffect, useRef } from "react";
import { RecordRTCPromisesHandler, StereoAudioRecorder } from "recordrtc";

// Hooks
import useQueryParam from "../hooks/useQueryParams";

// Libs
import createMasterTrack from "../libs/createMasterTrack";
import createPlaybackTrack from "../libs/createPlaybackTrack";
import { offlineRender } from "../libs/audio-export";
import { captureMicrophone } from "../libs/audio";

// Components
import Loader from "../components/Loader";

// Config
import config from "../config.json";

// Recorder stuff
const isEdge =
  navigator.userAgent.indexOf("Edge") !== -1 &&
  (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

let recorder; // globally accessible
let microphone;

// Support for blob.arrayBuffer() in iOS safari
(function () {
  File.prototype.arrayBuffer = File.prototype.arrayBuffer || myArrayBuffer;
  Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || myArrayBuffer;

  function myArrayBuffer() {
    // this: File or Blob
    return new Promise((resolve) => {
      let fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result);
      };
      fr.readAsArrayBuffer(this);
    });
  }
})();

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

if (!audioCtx.createGain) audioCtx.createGain = audioCtx.createGainNode;
if (!audioCtx.createDelay) audioCtx.createDelay = audioCtx.createDelayNode;
if (!audioCtx.createScriptProcessor)
  audioCtx.createScriptProcessor = audioCtx.createJavaScriptNode;

export const AudioContext = React.createContext();

const AudioContextProvider = ({ children }) => {
  // Refs
  const currentTime = useRef(0);
  const startedAt = useRef(0);
  const pausedAt = useRef(0);
  const recording = useRef(false);
  // const stream = useRef(null);

  // Query params
  const [song] = useQueryParam("song", "phoenix");
  const [initFaderDown] = useQueryParam("initFaderDown", null);
  const [hideMasterTrack] = useQueryParam("hideMasterTrack", false);
  const initFaderDownArray = initFaderDown ? initFaderDown.split(",") : [];

  // State
  const [masterTrack, setMasterTrack] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [mutedTracks, setMutedTracks] = useState([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportProgressStage, setExportProgressStage] = useState("");

  // Use effects
  useEffect(() => {
    const onLoad = async () => {
      const masterNode = createMasterNode();
      const playbackTracks = await loadAudio(masterNode);
      const inputTracks = [];
      setTracks([...playbackTracks, ...inputTracks]);
    };

    onLoad();

    return () => {
      audioCtx && audioCtx.close();
    };
  }, []);

  // Functions
  const createMasterNode = () => {
    const masterNode = createMasterTrack(audioCtx);
    setMasterTrack(masterNode);
    return masterNode;
  };

  const loadAudio = async (masterNode) => {
    let newTracks = [];
    let count = 1;

    for (const track of config.songs[song].tracks) {
      const progress = count / config.songs[song].tracks.length;
      setLoadProgress(progress);
      count++;
      if (!track) {
        return;
      }
      const newTrack = await createPlaybackTrack(
        audioCtx,
        masterNode,
        song,
        track,
        "file",
        initFaderDownArray
      );
      newTracks.push(newTrack);
    }
    return newTracks;
  };

  const getCurrentTime = () => {
    if (pausedAt.current) {
      currentTime.current = pausedAt.current;
      return pausedAt.current;
    }
    currentTime.current = audioCtx.currentTime - startedAt.current;
    return audioCtx.currentTime - startedAt.current;
  };

  const exportAudio = () => {
    const mixName = prompt("Name your mix");

    offlineRender(
      tracks,
      masterTrack,
      config.songs[song].duration,
      (data) => setExportProgress(data),
      (data) => setExportProgressStage(data),
      mixName
    );
  };

  // const recordStart = async () => {
  //   if (playing) {
  //     pauseAll();
  //   }

  //   if (pausedAt.current !== 0 || startedAt.current !== 0) {
  //     backToStart();
  //   }

  //   const newStream = await navigator.mediaDevices.getUserMedia({
  //     audio: true,
  //   });

  //   recorder = new StereoAudioRecorder(newStream, {
  //     sampleRate: 44100,
  //     bufferSize: 4096,
  //   });

  //   recorder.record();
  //   playAll();
  //   recording.current = true;
  //   stream = newStream;
  // };

  const recordStart = async () => {
    if (!microphone) {
      captureMicrophone(microphone, isEdge, function (mic) {
        microphone = mic;

        if (isSafari) {
          alert(
            "Please click startRecording button again. First time we tried to access your microphone. Now we will record it."
          );
          return;
        }

        recordStart();
      });
      return;
    }

    let options = {
      type: "audio",
      numberOfAudioChannels: isEdge ? 1 : 2,
      checkForInactiveTracks: true,
      bufferSize: 16384,
    };

    if (isSafari || isEdge) {
      options.recorderType = StereoAudioRecorder;
    }

    if (
      navigator.platform &&
      navigator.platform.toString().toLowerCase().indexOf("win") === -1
    ) {
      options.sampleRate = 48000; // or 44100 or remove this line for default
    }

    if (isSafari) {
      options.sampleRate = 44100;
      options.bufferSize = 4096;
      options.numberOfAudioChannels = 2;
    }

    if (recorder) {
      recorder.stream.getTracks((t) => t.stop());
      await recorder.reset();
      await recorder.destroy();
      recorder = null;
    }

    recorder = new RecordRTCPromisesHandler(microphone, options);
    console.log(recorder);

    if (playing) {
      pauseAll();
    }

    if (pausedAt.current !== 0 || startedAt.current !== 0) {
      backToStart();
    }
    recorder.startRecording();
    playAll();
    recording.current = true;
  };

  const recordStop = async () => {
    if (playing) {
      pauseAll();
    }

    recording.current = false;

    await recorder.stopRecording();
    let blob = await recorder.getBlob();

    const arrayBuffer = await blob.arrayBuffer();
    const trackName = prompt("Name your track");
    const trackData = {
      name: trackName,
      buffer: arrayBuffer,
    };

    const newTrack = await createPlaybackTrack(
      audioCtx,
      masterTrack,
      song,
      trackData,
      "buffer"
    );

    recorder = null;

    setTracks([...tracks, newTrack]);

    if (isSafari) {
      if (microphone) {
        // microphone.getTracks().forEach((track) => track.stop());
        microphone.stop();
        microphone = null;
      }
    }
    // });
  };

  const playBufferNode = (track, offset) => {
    // Web audio API is optimized for this behavior
    // Destroy original node

    stopTrack(track);

    const bufferSource = audioCtx.createBufferSource();
    bufferSource.buffer = track.decodedAudio;
    bufferSource.connect(track.muteNode);
    bufferSource.start(0, offset);

    track.buffer = bufferSource;
  };

  const playAll = () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const offset = pausedAt.current;

    tracks.forEach((track) => {
      playBufferNode(track, offset);
    });
    startedAt.current = audioCtx.currentTime - offset;
    pausedAt.current = 0;
    setPlaying(true);
  };

  const stopTrack = (track) => {
    if (track.buffer) {
      try {
        track.buffer.disconnect(track.muteNode);
        track.buffer.stop();
        track.buffer = null;
      } catch (e) {
        console.log(e);
      }
    }
  };

  const pauseAll = () => {
    const elapsed = audioCtx.currentTime - startedAt.current;
    tracks.forEach((track) => {
      stopTrack(track);
    });
    pausedAt.current = elapsed;
    setPlaying(false);
  };

  const togglePlayAll = () => {
    if (!playing) {
      playAll();
    } else {
      pauseAll();
    }
  };

  // useEffect(() => {
  //   const handleKeyDown = (event) => {
  //     if (event.keyCode === 32) {
  //       togglePlayAll();
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [togglePlayAll]);

  // TODO: implement with buffer
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

  // TODO: implement with buffer
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
    pausedAt.current = 0;
    startedAt.current = 0;
    tracks.forEach((track) => {
      stopTrack(track);
    });
    if (playing) {
      playAll();
    }
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
    tracks.forEach((track) => {
      if (track.id === id) {
        if (mute) {
          track.muteNode.gain.value = 0;
          setMutedTracks([...mutedTracks, track.id]);
          track.mute = true;
        }

        if (!mute) {
          track.muteNode.gain.value = 1;
          track.mute = false;
          const newMutedTracks = [...mutedTracks].filter((trackId) => {
            return trackId !== id;
          });
          setMutedTracks(newMutedTracks);
        }
      }
    });
  };

  const toggleDelay = (track, delay) => {
    if (delay) {
      // Parallel processing
      track.pannerNode
        .connect(track.convolverNode)
        .connect(masterTrack.gainNode);
      track.delay = true;
    } else {
      track.pannerNode.disconnect(track.convolverNode);
      track.convolverNode.disconnect(masterTrack.gainNode);
      track.pannerNode.connect(masterTrack.gainNode);
      track.delay = false;
    }
  };

  const toggleRecord = (record) => {
    if (record) {
      recordStart();
    } else {
      recordStop();
    }
  };

  const deleteTrack = (track) => {
    stopTrack(track);
    const tracksCopy = tracks.filter((item) => item.id !== track.id);
    setTracks(tracksCopy);
  };

  return (
    <AudioContext.Provider
      value={{
        togglePlayAll,
        playing: () => playing,
        recording: () => recording.current,
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
        getCurrentTime,
        song: () => song,
        toggleDelay,
        toggleRecord,
        isMasterTrackHidden: () => hideMasterTrack,
        deleteTrack,
      }}
    >
      {exportProgress ? (
        <Loader progress={exportProgress} text={exportProgressStage} />
      ) : !tracks || tracks.length < 1 ? (
        <Loader progress={loadProgress} text="Loading Audio Assets..." />
      ) : (
        children
      )}
    </AudioContext.Provider>
  );
};

export default AudioContextProvider;
