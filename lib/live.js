const { spawn } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = class FacebookLive {
  constructor() {
    this.stream_url = null;
    this.stream_key = null;
    this.youtubeURL = null;
    this.videoPath = null;
    this.runOptions = {
      maxrate: '2000k',
      abitrate: '128k',
      scale: '1280:720',
      fps: '30'
    };
    this.defaultDir = process.cwd();
  }

  setSecretKey(secretKey) {
    this.stream_key = secretKey;
    return this;
  }

  setRTMP(rtmpURL) {
    this.stream_url = rtmpURL;
    return this;
  }

  setVideo(videoPath) {
    this.videoPath = path.resolve(this.defaultDir, videoPath);
    return this;
  }

  setYouTube(youtubeURL) {
    this.youtubeURL = youtubeURL;
    return this;
  }

  setDir(dir) {
    this.defaultDir = dir ?? process.cwd();
    return this;
  }

  downloadYoutube() {
    return new Promise(async (resolve) => {
      let { videoDetails: { videoId, title } } = await ytdl.getInfo(this.youtubeURL);
      console.log(`Downloading ${title}`);
      ytdl(this.youtubeURL).pipe(fs.createWriteStream(path.resolve(this.defaultDir, videoId + '.mp4')))
        .on('finish', () => {
          this.setVideo(path.resolve(this.defaultDir, videoId + '.mp4'));
          resolve();
        })
    });
  }

  setMaxRate(maxrate) {
    this.runOptions.maxrate = maxrate ?? '2000k';
    return this;
  }

  setAudioBitrate(bitrate) {
    this.runOptions.abitrate = bitrate ?? '128k';
    return this;
  }

  setVideoScale(width, height) {
    this.runOptions.scale = width && height ? `${width}:${height}` : '1280:720';
    return this;
  }

  setVideoFPS(fps) {
    this.runOptions.fps = fps ?? '30';
    return this;
  }

  run() {
    var _this = this;
    return new Promise(async function(resolve, reject) {
      if (_this.stream_key && _this.stream_url) {
        if (_this.youtubeURL) await _this.downloadYoutube();
        let spawnProcess = spawn(ffmpeg, [
          '-re',
          '-i', _this.videoPath,
          '-f', 'flv',
          '-profile:v', 'baseline',
          '-pix_fmt', 'yuv420p',
          '-acodec', 'aac',
          '-ar', '44100',
          '-b:a', _this.runOptions.abitrate,
          '-vcodec', 'libx264',
          '-bufsize', '6000k',
          '-vb', '6000k',
          '-vf', 'scale=' + _this.runOptions.scale,
          '-maxrate', _this.runOptions.maxrate,
          '-preset', 'veryfast',
          '-r', _this.runOptions.fps,
          '-g', '30',
          _this.stream_url + _this.stream_key
        ], { stdio: 'inherit' });
        spawnProcess.on('close', (code) => {
          if (code === 0) return resolve(_this);
          else return reject('ffmpeg process exited with code ' + code);
        }).on('error', (err) => {
          return reject(err);
        });
      }
      return reject('Missing secret key or RTMP URL');
    })
  }

  async autoClean() {
    if (this.videoPath) {
      fs.unlinkSync(this.videoPath);
    }
    return this;
  }
}