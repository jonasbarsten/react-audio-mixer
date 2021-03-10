export function createAsyncBufferSource(audioCtx, arrayBuffer) {
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

export function offsetBuffer(audioCtx, recordingBuffer, before, after) {
  console.log("player.offsetBuffer", recordingBuffer, before, after);
  var i = 0,
    channel = 0,
    channelTotal = 2,
    num = 0,
    audioBuffer = audioCtx.createBuffer(
      channelTotal,
      before + recordingBuffer[0].length + after,
      audioCtx.sampleRate
    ),
    buffer = null;
  for (channel = 0; channel < channelTotal; channel += 1) {
    buffer = audioBuffer.getChannelData(channel);
    for (i = 0; i < before; i += 1) {
      buffer[num] = 0;
      num += 1;
    }
    for (i = 0; i < recordingBuffer[channel].length; i += 1) {
      buffer[num] = recordingBuffer[channel][i];
      num += 1;
    }
    for (i = 0; i < after; i += 1) {
      buffer[num] = 0;
      num += 1;
    }
  }
  return audioBuffer;
}

export function getOffset(
  audioCtx,
  recordingBuffer,
  referenceBuffer,
  offset,
  recorder
) {
  let diff = recorder.startTime + offset / 1000 - referenceBuffer.startTime;
  console.log("player.getOffset", diff);
  return {
    before: Math.round(
      (diff % referenceBuffer.buffer.duration) * audioCtx.sampleRate
    ),
    after: Math.round(
      (referenceBuffer.buffer.duration -
        ((diff + recordingBuffer.duration) % referenceBuffer.buffer.duration)) *
        audioCtx.sampleRate
    ),
  };
}

export function createBuffer(audioCtx, buffers, channelTotal) {
  let channel = 0;
  let buffer = audioCtx.createBuffer(
    channelTotal,
    buffers[0].length,
    audioCtx.sampleRate
  );
  for (channel = 0; channel < channelTotal; channel += 1) {
    buffer.getChannelData(channel).set(buffers[channel]);
  }
  return buffer;
}
