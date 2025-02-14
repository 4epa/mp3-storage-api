import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

export const getMetadata = async (buffer: Buffer) => {
  const tempFilePath = join(tmpdir(), `temp-audio-${Date.now()}.mp3`);

  await writeFile(tempFilePath, buffer);

  return new Promise<any>((resolve, reject) =>
    ffmpeg.ffprobe(tempFilePath, function (err, metadata) {
      if (err) return reject(err);
      resolve(metadata.format?.duration);
    }),
  ).finally(async () => {
    await unlink(tempFilePath).catch(() => null);
  });
};
