import {
  Controller,
  UploadedFiles,
  Post,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Post('create')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
  )
  async createTrack(
    @UploadedFiles()
    files: { poster: Express.Multer.File[]; audio: Express.Multer.File[] },
    @Body() body: { title: string; authorId: number },
  ) {
    const data = {
      poster: files.poster[0],
      audio: files.audio[0],
      title: body.title,
      authorId: +body.authorId,
    };

    return this.trackService.createTrack(data);
  }
}
