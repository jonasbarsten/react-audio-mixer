// import lamejs from "lamejs";

// function forceDownload(blob, fileName) {
//   const url = (window.URL || window.webkitURL).createObjectURL(blob);
//   const link = window.document.createElement("a");
//   link.href = url;
//   link.download = fileName || "my mix.wav";
//   link.click();
// }

// function writeString(view, offset, string) {
//   for (var i = 0; i < string.length; i++) {
//     view.setUint8(offset + i, string.charCodeAt(i));
//   }
// }

// function floatTo16BitPCM(output, offset, input) {
//   for (var i = 0; i < input.length; i++, offset += 2) {
//     var s = Math.max(-1, Math.min(1, input[i]));
//     output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
//   }
// }

// function mergeBuffers(buffers, recLength) {
//   console.log(buffers);
//   console.log(recLength);
//   var result = new Float32Array(recLength);
//   console.log(result);
//   var offset = 0;
//   for (var i = 0; i < buffers.length; i++) {
//     result.set(buffers[i], offset);
//     offset += buffers[i].length;
//   }
//   return result;
// }

// function interleave(inputL, inputR) {
//   var length = inputL.length + inputR.length;
//   // var result = new Float32Array(length);
//   var result = new Int16Array(length);

//   var index = 0,
//     inputIndex = 0;

//   while (index < length) {
//     result[index++] = inputL[inputIndex];
//     result[index++] = inputR[inputIndex];
//     inputIndex++;
//   }
//   return result;
// }

// function encodeWAV(samples, numChannels, sampleRate) {
//   var buffer = new ArrayBuffer(44 + samples.length * 2);
//   var view = new DataView(buffer);

//   /* RIFF identifier */
//   writeString(view, 0, "RIFF");
//   /* RIFF chunk length */
//   view.setUint32(4, 36 + samples.length * 2, true);
//   /* RIFF type */
//   writeString(view, 8, "WAVE");
//   /* format chunk identifier */
//   writeString(view, 12, "fmt ");
//   /* format chunk length */
//   view.setUint32(16, 16, true);
//   /* sample format (raw) */
//   view.setUint16(20, 1, true);
//   /* channel count */
//   view.setUint16(22, numChannels, true);
//   /* sample rate */
//   view.setUint32(24, sampleRate, true);
//   /* byte rate (sample rate * block align) */
//   view.setUint32(28, sampleRate * 4, true);
//   /* block align (channel count * bytes per sample) */
//   view.setUint16(32, numChannels * 2, true);
//   /* bits per sample */
//   view.setUint16(34, 16, true);
//   /* data chunk identifier */
//   writeString(view, 36, "data");
//   /* data chunk length */
//   view.setUint32(40, samples.length * 2, true);

//   floatTo16BitPCM(view, 44, samples);

//   return view;
// }

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

// export function offsetBuffer(audioCtx, recordingBuffer, before, after) {
//   console.log("player.offsetBuffer", recordingBuffer, before, after);
//   var i = 0,
//     channel = 0,
//     channelTotal = 2,
//     num = 0,
//     audioBuffer = audioCtx.createBuffer(
//       channelTotal,
//       before + recordingBuffer[0].length + after,
//       audioCtx.sampleRate
//     ),
//     buffer = null;
//   for (channel = 0; channel < channelTotal; channel += 1) {
//     buffer = audioBuffer.getChannelData(channel);
//     for (i = 0; i < before; i += 1) {
//       buffer[num] = 0;
//       num += 1;
//     }
//     for (i = 0; i < recordingBuffer[channel].length; i += 1) {
//       buffer[num] = recordingBuffer[channel][i];
//       num += 1;
//     }
//     for (i = 0; i < after; i += 1) {
//       buffer[num] = 0;
//       num += 1;
//     }
//   }
//   return audioBuffer;
// }

// export function getOffset(
//   audioCtx,
//   recordingBuffer,
//   referenceBuffer,
//   offset,
//   recorder
// ) {
//   let diff = recorder.startTime + offset / 1000 - referenceBuffer.startTime;
//   console.log("player.getOffset", diff);
//   return {
//     before: Math.round(
//       (diff % referenceBuffer.buffer.duration) * audioCtx.sampleRate
//     ),
//     after: Math.round(
//       (referenceBuffer.buffer.duration -
//         ((diff + recordingBuffer.duration) % referenceBuffer.buffer.duration)) *
//         audioCtx.sampleRate
//     ),
//   };
// }

// export function createBuffer(audioCtx, buffers, channelTotal) {
//   let channel = 0;
//   let buffer = audioCtx.createBuffer(
//     channelTotal,
//     buffers[0].length,
//     audioCtx.sampleRate
//   );
//   for (channel = 0; channel < channelTotal; channel += 1) {
//     buffer.getChannelData(channel).set(buffers[channel]);
//   }
//   return buffer;
// }

// export function exportWAV(type, allBuffers, recLength, numChannels) {
//   // var buffers = [];
//   // for (var channel = 0; channel < numChannels; channel++) {
//   //   buffers.push(mergeBuffers(allBuffers[channel], recLength));
//   // }
//   let interleaved = undefined;
//   if (numChannels === 2) {
//     interleaved = interleave(allBuffers[2], allBuffers[4]);
//   } else {
//     interleaved = allBuffers[0];
//   }
//   const dataView = encodeWAV(interleaved, numChannels, 48000);
//   const audioBlob = new Blob([dataView], { type: type });
//   console.log(audioBlob);

//   forceDownload(audioBlob, "my mix.wav");
// }

// export function exportMP3(allBuffers) {
//   const channels = 1; //1 for mono or 2 for stereo
//   const sampleRate = 44100; //44.1khz (normal mp3 samplerate)
//   const kbps = 128; //encode 128kbps mp3
//   const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);

//   const interleaved = interleave(allBuffers[2], allBuffers[4]);

//   const samples = interleaved; //one second of silence (get your data from the source you have)
//   const sampleBlockSize = 1152; //can be anything but make it a multiple of 576 to make encoders life easier

//   var mp3Data = [];
//   for (var i = 0; i < samples.length; i += sampleBlockSize) {
//     const sampleChunk = samples.subarray(i, i + sampleBlockSize);
//     var mp3buf = mp3encoder.encodeBuffer(sampleChunk);
//     if (mp3buf.length > 0) {
//       mp3Data.push(mp3buf);
//     }
//   }
//   const d = mp3encoder.flush(); //finish writing mp3

//   if (d.length > 0) {
//     mp3Data.push(new Int8Array(mp3buf));
//   }

//   const blob = new Blob(mp3Data, { type: "audio/mp3" });
//   forceDownload(blob, "test.mp3");
// }

// export function getAsyncInputStream() {
//   return new Promise((resolve, reject) => {
//     if (navigator.mediaDevices) {
//       navigator.mediaDevices
//         .getUserMedia({ audio: true })
//         .then((stream) => {
//           resolve(stream);
//         })
//         .catch((e) => {
//           window.alert("The following gUM error occurred: " + e);
//         });
//     } else {
//       window.alert(
//         "Your browser does not support recording, try Google Chrome"
//       );
//     }
//   });
// }

// export function exportWAV(
//   type,
//   allBuffers,
//   recLength,
//   numChannels,
//   before = 0,
//   after = 0
// ) {
//   // if (!before) {
//   //   before = 0;
//   // }
//   // if (!after) {
//   //   after = 0;
//   // }

//   var channel = 0,
//     buffers = [];
//   for (channel = 0; channel < numChannels; channel++) {
//     buffers.push(mergeBuffers(allBuffers[channel], recLength));
//   }

//   var i = 0,
//     offset = 0,
//     newbuffers = [];

//   for (channel = 0; channel < numChannels; channel += 1) {
//     offset = 0;
//     newbuffers[channel] = new Float32Array(before + recLength + after);
//     if (before > 0) {
//       for (i = 0; i < before; i += 1) {
//         newbuffers[channel].set([0], offset);
//         offset += 1;
//       }
//     }
//     newbuffers[channel].set(buffers[channel], offset);
//     offset += buffers[channel].length;
//     if (after > 0) {
//       for (i = 0; i < after; i += 1) {
//         newbuffers[channel].set([0], offset);
//         offset += 1;
//       }
//     }
//   }

//   let interleaved = undefined;

//   if (numChannels === 2) {
//     interleaved = interleave(newbuffers[0], newbuffers[1]);
//   } else {
//     interleaved = newbuffers[0];
//   }

//   // var downsampledBuffer = downsampleBuffer(interleaved, rate);
//   // var dataview = encodeWAV(downsampledBuffer, rate);
//   const dataView = encodeWAV(interleaved, numChannels, 48000);
//   var audioBlob = new Blob([dataView], { type: type });

//   forceDownload(audioBlob, "my mix.wav");

//   // this.postMessage(audioBlob);
// }
