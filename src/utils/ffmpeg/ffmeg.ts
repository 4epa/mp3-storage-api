import { Ffmpeg } from './types';

const ffmpeg: Ffmpeg = require('fluent-ffmpeg');
const ffmpegPath: string = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath: string = require('@ffprobe-installer/ffprobe').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export default ffmpeg;
