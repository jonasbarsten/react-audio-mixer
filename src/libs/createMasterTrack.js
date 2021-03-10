const createMasterTrack = (audioCtx) => {
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

  return masterNode;
};

export default createMasterTrack;
