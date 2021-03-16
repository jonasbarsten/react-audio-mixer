export function getAsyncInputStream() {
  return new Promise((resolve, reject) => {
    if (navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          resolve(stream);
        })
        .catch((e) => {
          window.alert("The following gUM error occurred: " + e);
        });
    } else {
      window.alert(
        "Your browser does not support recording, try Google Chrome"
      );
    }
  });
}

const createInputTrack = async (audioCtx, masterNode) => {
  let newInputTrack = {
    id: "123",
    type: "input",
    solo: false,
    mute: true,
    delay: false,
  };

  const stream = await getAsyncInputStream();

  // Creating audio, gain, analyser and panner nodes
  const audioNode = audioCtx.createMediaStreamSource(stream);
  const recorder = new MediaRecorder(stream);
  const muteNode = audioCtx.createGain();
  const gainNode = audioCtx.createGain();
  const analyserNode = audioCtx.createAnalyser();
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

  // Connecting the nodes and connecting it to the master gain node
  audioNode
    .connect(muteNode)
    .connect(gainNode)
    .connect(pannerNode)
    .connect(analyserNode)
    .connect(masterNode.gainNode);

  newInputTrack.recorder = recorder;
  newInputTrack.audioNode = audioNode;
  newInputTrack.gainNode = gainNode;
  newInputTrack.muteNode = muteNode;
  newInputTrack.pannerNode = pannerNode;
  newInputTrack.analyserNode = analyserNode;

  // Mute = true :)
  newInputTrack.muteNode.gain.value = 0;

  return newInputTrack;
};

export default createInputTrack;
