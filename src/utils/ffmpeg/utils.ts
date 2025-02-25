import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { FfprobeFormat } from 'fluent-ffmpeg';
import ffmpeg from './ffmeg';

const FILES_DIR = join(process.cwd(), 'files');

export const compressAudioFile = (inputPath: string, outputPath: string) => {
  return new Promise<string>((resolve, reject) => {
    ffmpeg(inputPath)
      .audioBitrate(128)
      .save(outputPath)
      .on('end', () => resolve('success'))
      .on('error', (err) => reject(new Error(err.message)));
  });
};

export const getMetadata = async (filePath: string) => {
  return new Promise<FfprobeFormat>((resolve, reject) => {
    ffmpeg(filePath).ffprobe((error, data) => {
      if (error) return reject(new Error('error reading data'));
      resolve(data.format);
    });
  });
};

export const preprocessingAudioFile = async (buffer: Buffer) => {
  await mkdir(FILES_DIR, { recursive: true });

  const inputPath = join(FILES_DIR, `input-audio-${Date.now()}.mp3`);
  const outputPath = join(FILES_DIR, `output-audio-${Date.now()}.mp3`);

  await writeFile(inputPath, buffer);

  try {
    await compressAudioFile(inputPath, outputPath);

    const metadata = await getMetadata(outputPath);

    const outputBuffer = await readFile(outputPath);

    await unlink(inputPath).catch(() => null);
    await unlink(outputPath).catch(() => null);

    return {
      metadata: metadata,
      buffer: outputBuffer,
    };
  } catch (error) {
    await unlink(inputPath).catch(() => null);
    await unlink(outputPath).catch(() => null);

    console.log(error);
    return null;
  }
};
