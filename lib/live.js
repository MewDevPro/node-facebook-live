const { spawnSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = class FacebookLive {
  constructor() {
    this.stream_url = null;
    this.stream_key = null;
    this.youtubeURL = null;
    this.defaultDir = process.cwd();
    this.videoPath = null;
    this.runOptions = {
      maxrate: '2000k',
      abitrate: '128k',
      scale: '1280:720',
      fps: '30'
    };
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
    this.videoPath = videoPath;
    return this;
  }

  setYouTube(youtubeURL) {
    this.youtubeURL = youtubeURL;
    return this;
  }

  setDir(dir) {
    this.defaultDir = dir;
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
    this.runOptions.maxrate = maxrate;
    return this;
  }

  setAudioBitrate(bitrate) {
    this.runOptions.abitrate = bitrate;
    return this;
  }

  setVideoScale(width, height) {
    this.runOptions.scale = `${width}:${height}`;
    return this;
  }

  setVideoFPS(fps) {
    this.runOptions.fps = fps;
    return this;
  }

  async run() {
    if (this.stream_key && this.stream_url) {
      if (this.youtubeURL) await this.downloadYoutube();
      spawnSync(ffmpeg, [
        '-re',
        '-i', this.videoPath,
        '-f', 'flv',
        '-profile:v', 'baseline',
        '-pix_fmt', 'yuv420p',
        '-acodec', 'aac',
        '-ar', '44100',
        '-b:a', this.runOptions.abitrate,
        '-vcodec', 'libx264',
        '-bufsize', '6000k',
        '-vb', '6000k',
        '-vf', 'scale=' + this.runOptions.scale,
        '-maxrate', this.runOptions.maxrate,
        '-preset', 'veryfast',
        '-r', this.runOptions.fps,
        '-g', '30',
        this.stream_url + this.stream_key
      ], { stdio: 'inherit' });
      return this;
    }
    throw new Error('Missing secret key or RTMP URL');
  }

  async autoClean() {
    if (this.videoPath) {
      fs.unlinkSync(this.videoPath);
    }
    return this;
  }
}