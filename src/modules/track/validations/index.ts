import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const IMAGE_REGEX = new RegExp('image/');
const AUDIO_REGEX = new RegExp('audio/mpeg');

@Injectable()
export class ParseFilesPipe implements PipeTransform {
  transform(files: {
    poster: Express.Multer.File[];
    audio: Express.Multer.File[];
  }) {
    const isEmptyFiles =
      !files.audio ||
      !files.audio.length ||
      !files.poster ||
      !files.poster.length;

    if (isEmptyFiles) {
      throw new BadRequestException('No files uploaded');
    }

    // console.log(files.poster);

    const isValidPosterType = files.poster.every((poster) =>
      IMAGE_REGEX.test(poster.mimetype),
    );
    const isValidAudioTypes = files.audio.every((audio) =>
      AUDIO_REGEX.test(audio.mimetype),
    );

    if (!isValidPosterType) {
      throw new BadRequestException('Incorrect poster file type');
    }

    if (!isValidAudioTypes) {
      throw new BadRequestException('Incorrect audio file type');
    }

    return files;
  }
}
