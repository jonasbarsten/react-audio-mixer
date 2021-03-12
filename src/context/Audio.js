// buffer source -> mute -> gain -> pan -> (track analyser) -> master gain -> splitter -> (master analyser x 2 VU) -> merger -> dest
import React, { useState, useEffect, useRef } from "react";

// Hooks
import useQueryParam from "../hooks/useQueryParams";

// Libs
import createMasterTrack from "../libs/createMasterTrack";
import createPlaybackTrack from "../libs/createPlaybackTrack";
import createInputTrack from "../libs/createInputTrack";
import { createAsyncBufferSource, exportWAV } from "../libs/audio";

// Components
import Loader from "../components/Loader";

// Config
import config from "../config.json";

let audioCtx = null;

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
} catch (e) {
  window.alert("Your browser does not support WebAudio, try Google Chrome");
}

export const AudioContext = React.createContext();

const AudioContextProvider = ({ children }) => {
  const currentTime = useRef(0);
  const startedAt = useRef(0);
  const pausedAt = useRef(0);
  const [song, setSong] = useQueryParam("song", "phoenix");
  const recording = useRef(false);
  const recordedChunks = useRef([]);
  const [masterTrack, setMasterTrack] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [mutedTracks, setMutedTracks] = useState([]);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const onLoad = async () => {
      const masterNode = createMasterNode();
      const playbackTracks = await loadAudio(masterNode);
      const inputTracks = await createInputNode(masterNode);
      setTracks([...playbackTracks, ...inputTracks]);
    };

    onLoad();

    return () => {
      audioCtx && audioCtx.close();
      tracks &&
        tracks.forEach((track) => {
          if (track.recorder) {
            track.recorder.removeEventListener(
              "dataavailable",
              handleRecordedData
            );
          }
        });
    };
  }, []);

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
        track
      );
      newTracks.push(newTrack);
    }
    return newTracks;
    // createInputNode(masterNode, newTracks);
  };

  const createInputNode = async (masterNode) => {
    const newInputTrack = await createInputTrack(audioCtx, masterNode);
    setMutedTracks([...mutedTracks, newInputTrack.id]);

    newInputTrack.recorder.addEventListener(
      "dataavailable",
      handleRecordedData
    );

    return [newInputTrack];
  };

  const getCurrentTime = () => {
    if (pausedAt.current) {
      currentTime.current = pausedAt.current;
      return pausedAt.current;
    }
    // if (startedAt.current) {
    currentTime.current = audioCtx.currentTime - startedAt.current;
    return audioCtx.currentTime - startedAt.current;
    // }
    // return 0;
  };

  const exportAudio = () => {
    console.log("Exporting ...");
  };

  const recordStart = (track) => {
    backToStart();
    recording.current = true;
    track.recorder.startTime = audioCtx.currentTime;
    track.recorder.start();
  };

  const recordStop = async (track) => {
    recording.current = false;
    track.recorder.stop();
    console.log(recordedChunks.current);

    setTimeout(async () => {
      const blob = new Blob(recordedChunks.current, {
        type: "audio/ogg; codecs=opus",
      });
      const audioArrayBuffer = await blob.arrayBuffer();
      const decodedAudio = await createAsyncBufferSource(
        audioCtx,
        audioArrayBuffer
      );
      const bufferSource = audioCtx.createBufferSource();
      bufferSource.buffer = decodedAudio;

      track.buffer = bufferSource;
      track.type = "playback";
      playBufferNode(track, 0);
      pauseAll();

      recordedChunks.current = [];
    }, 1000);
  };

  const handleRecordedData = async (e) => {
    const allChunks = [...recordedChunks.current, e.data];
    recordedChunks.current = allChunks;
  };

  const playBufferNode = (track, offset) => {
    const bufferSource = audioCtx.createBufferSource();
    bufferSource.buffer = track.decodedAudio;
    track.buffer = bufferSource;
    track.buffer.connect(track.muteNode);
    track.buffer.start(0, offset);
  };

  const playAll = () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const offset = pausedAt.current;

    tracks.forEach((track) => {
      if (track.type === "playback") {
        playBufferNode(track, offset);
      }
    });
    startedAt.current = audioCtx.currentTime - offset;
    pausedAt.current = 0;
    setPlaying(true);
  };

  const pauseAll = () => {
    const elapsed = audioCtx.currentTime - startedAt.current;
    tracks.forEach((track) => {
      if (track.type === "playback") {
        track.buffer.stop();
      }
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
      if (track.type === "playback") {
        track.buffer.stop(0);
      }
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
        recordStart,
        recordStop,
        getCurrentTime,
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
