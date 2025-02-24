import {
  BadRequestException,
  UnauthorizedException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrackDTO, DeleteTrackDTO } from './dto';
import { FileService } from '../file/file.service';
import { generateUUID } from 'src/utils/generateUUID';
import { preprocessingAudioFile } from 'src/utils/ffmpeg/utils';
import { Prisma, Track } from '@prisma/client';
import { ERRORS } from './errors';

@Injectable()
export class TrackService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async track(
    trackWhereUniqueInput: Prisma.TrackWhereUniqueInput,
  ): Promise<null | Track> {
    return this.prismaService.track.findUnique({
      where: trackWhereUniqueInput,
    });
  }

  async tracks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TrackWhereUniqueInput;
    where?: Prisma.TrackWhereInput;
    orderBy?: Prisma.TrackOrderByWithRelationInput;
  }) {
    return this.prismaService.track.findMany({ ...params });
  }

  async getReactedTracks(data: {
    userId: number;
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.TrackWhereUniqueInput;
      orderBy?: Prisma.TrackOrderByWithRelationInput;
    };
  }) {
    return this.prismaService.track.findMany({
      ...data.params,
      where: { reactions: { some: { userId: data.userId } } },
    });
  }

  async checkAuthor(trackId: number, authorId: number): Promise<boolean> {
    const existTrack = await this.track({ id: trackId });

    if (existTrack?.authorId !== authorId)
      throw new UnauthorizedException(ERRORS.wrongAuthor);

    return existTrack?.authorId === authorId;
  }

  async createTrack(data: CreateTrackDTO): Promise<Track> {
    const trackUID = generateUUID();

    const audioFileKey = `audio-${data.authorId}-${trackUID}`;
    const posterFileKey = `poster-${data.authorId}-${trackUID}`;

    const preprocessedAudio = await preprocessingAudioFile(data.audio.buffer);

    if (!preprocessedAudio)
      throw new BadRequestException('Failed to preprocessing audio file');

    await this.fileService.upload(
      preprocessedAudio.buffer,
      audioFileKey,
      data.audio.mimetype,
    );
    await this.fileService.upload(
      data.poster.buffer,
      posterFileKey,
      data.poster.mimetype,
    );

    const duration = preprocessedAudio.metadata.duration!;

    return this.prismaService.track.create({
      data: {
        uid: trackUID,
        title: data.title,
        audio: audioFileKey,
        poster: posterFileKey,
        authorId: data.authorId,
        duration: duration,
        genres: {
          connect: data.genresId.map((id) => ({ id: id })),
        },
      },
    });
  }

  async deleteTrack(data: DeleteTrackDTO) {
    const existTrack = await this.track({ id: data.trackId });

    if (!existTrack)
      throw new BadRequestException(ERRORS.noExistTrack(data.trackId));

    await this.fileService.remove([existTrack.poster, existTrack.audio]);

    return this.prismaService.track.delete({
      where: {
        id: data.trackId,
      },
    });
  }
}
