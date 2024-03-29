## adding new songs:

- Add tracks etc to config.json
- Add folder with same name as song to /public/sounds/{songName} with mp3 files

## iOS:

- Remember to turn off "do not disturb" aka vibrate mode ...
- On old devices meters will lag ...
- Has to be https to allow cam / mic

## demo:

https://d32p0rv4tdmjoq.cloudfront.net?song=phoenix

## query params

- ?song=phoenix
- ?initFaderDown=triggers,keys
- ?hideMasterTrack=true
- ?lang={"no" | "en"}

## iFrame

<iframe
  allow="camera;microphone"
  src="https://d32p0rv4tdmjoq.cloudfront.net/?song=stokkmaur">
</iframe>

## inspo

- http://kevvv.in/mix/
- https://github.com/kevincennis/Mix.js
- https://github.com/philnash/react-web-audio
- https://videohive.net/item/audio-react-analog-vu-meter/5467966?ref=DEM-G&fbclid=IwAR04wcBdKRPa87afhHRO6UXRENV616AoCYGKWFGHxQLH0GOqfQKNSBrG-P0&clickthrough_id=1421517602&redirect_back=true
- https://medium.com/creative-technology-concepts-code/recording-syncing-and-exporting-web-audio-1e1a1e35ef08
- https://jsfiddle.net/kmturley/n5atqwhm/
- https://webaudioapi.com/

### DAW:

- https://awesomeopensource.com/project/naomiaro/waveform-playlist
- https://alemangui.github.io/pizzicato/
- https://github.com/alemangui/pizzicato/issues/124
- https://www.npmjs.com/package/recordrtc
- https://www.webrtc-experiment.com/RecordRTC/simple-demos/
