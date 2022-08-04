# node-facebook-live
### A module to share a video to Facebook Live Streaming

## Installation

```bash
npm install https://github.com/MewDevPro/node-facebook-live.git
```

## Usage

```js
var FacebookLive = require('facebook-live');
(async() => {
  var live = new FacebookLive()
    .setRTMP('Facebook RTMP URL')
    .setSecretKey('Your secret stream key')
    .setDir(__dirname) // default is process.cwd()
    .setVideo('/path/to/video') // disable this when using setYouTube()
    .setYouTube('YouTube video URL') // disable this when using setVideo()
    .setMaxRate('1000k')
    .setAudioBitrate('128k')
    .setVideoScale('1280', '720') // 16:9
  await live.run()
  await live.autoClean() // auto delete files after streaming
})().catch(console.error);
```