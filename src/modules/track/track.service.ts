import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackDTO } from './dto';
import { FileService } from '../file/file.service';
import { generateUUID } from 'src/utils/generateUUID';
import { getMetadata } from 'src/utils/GetMetadata';

@Injectable()
export class TrackService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async createTrack(data: CreateTrackDTO) {
    const trackUID = generateUUID();

    const audioFileKey = `audio-${data.authorId}-${trackUID}`;
    const posterFileKey = `poster-${data.authorId}-${trackUID}`;

    const date = new Date();

    const createAt = date.toISOString();

    // await this.fileService.upload(
    //   data.audio.buffer,
    //   audioFileKey,
    //   data.audio.mimetype,
    // );
    // await this.fileService.upload(
    //   data.poster.buffer,
    //   posterFileKey,
    //   data.poster.mimetype,
    // );

    console.log(data.audio);

    const duration = await getMetadata(data.audio.buffer);

    if (!duration)
      throw new BadRequestException('Failed to parse file metadata');

    return this.prismaService.track.create({
      data: {
        uid: trackUID,
        title: data.title,
        audio: audioFileKey,
        poster: posterFileKey,
        authorId: data.authorId,
        duration: duration,
        createdAt: createAt,
        updatedAt: createAt,
      },
    });
  }
}
