# node-facebook-live
### A module to share a video to Facebook Live Streaming

## Installation

```bash
npm install https://github.com/MewDevPro/node-facebook-live.git
```

## Usage

```js
var FacebookLive = require('facebook-live');
var live = new FacebookLive();
(async() => {
  await live
    .setRTMP('Facebook RTMP URL')
    .setSecretKey('Your secret stream key')
    .setVideo('Video path') // disable this when using setYouTube()
    .setYouTube('YouTube video URL') // disable this when using setVideo()
    .setMaxRate('1000k')
    .setAudioBitrate('128k')
    .setVideoScale('1280', '720')
    .setDir(__dirname) // default is process.cwd()
    .run()
  await live.autoClean() // auto delete files after streaming
})();
```