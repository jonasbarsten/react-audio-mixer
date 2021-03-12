function writeString(view, offset, string) {
  for (var i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output, offset, input) {
  for (var i = 0; i < input.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function mergeBuffers(buffers, recLength) {
  var result = new Float32Array(recLength);
  var offset = 0;
  for (var i = 0; i < buffers.length; i++) {
    result.set(buffers[i], offset);
    offset += buffers[i].length;
  }
  return result;
}

function interleave(inputL, inputR) {
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function encodeWAV(samples, numChannels, sampleRate) {
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, "RIFF");
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, "WAVE");
  /* format chunk identifier */
  writeString(view, 12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, "data");
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}

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

export function exportWAV(type, recBuffers, recLength, numChannels) {
  var buffers = [];
  for (var channel = 0; channel < numChannels; channel++) {
    buffers.push(mergeBuffers(recBuffers[channel], recLength));
  }
  var interleaved = undefined;
  if (numChannels === 2) {
    interleaved = interleave(buffers[0], buffers[1]);
  } else {
    interleaved = buffers[0];
  }
  var dataView = encodeWAV(interleaved);
  var audioBlob = new Blob([dataView], { type: type });

  return audioBlob;

  // self.postMessage({ command: "exportWAV", data: audioBlob });
}
