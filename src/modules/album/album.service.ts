import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateUUID } from 'src/utils/generateUUID';
import { CreateAlbumDTO } from './dto';
import { preprocessingAudioFile } from 'src/utils/ffmpeg/utils';
import { FileService } from '../file/file.service';
import { Prisma } from '@prisma/client';
import { ERRORS } from './errors';

@Injectable()
export class AlbumService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async album(param: Prisma.AlbumFindUniqueArgs) {
    return this.prismaService.album.findUnique(param);
  }

  async albums(param: Prisma.AlbumFindManyArgs) {
    return this.prismaService.album.findMany(param);
  }

  async getReactedAlbums(data: {
    userId: number;
    params: {
      skip?: number;
      take?: number;
      cursor?: Prisma.AlbumWhereUniqueInput;
      orderBy?: Prisma.AlbumOrderByWithRelationInput;
    };
  }) {
    return this.prismaService.album.findMany({
      ...data.params,
      where: { reactions: { some: { userId: data.userId } } },
    });
  }

  async create(data: CreateAlbumDTO) {
    const uid = generateUUID();

    const trackAudios = data.trackAudios;
    const trackTitles = data.trackTitles.split(',');
    const genres = data.genresId.split(',');

    const posterFileKey = `poster-${data.authorId}-${uid}`;

    await this.fileService.upload(
      data.poster.buffer,
      posterFileKey,
      data.poster.mimetype,
    );

    const tracksData: Prisma.TrackCreateWithoutAlbumInput[] = [];

    for (let index = 0; index < data.trackAudios.length; index++) {
      const audioFile = trackAudios[index];
      const trackTitle = trackTitles[index];
      const trackUID = generateUUID();
      const trackFileKey = `audio-${data.authorId}-${trackUID}`;

      const preprocessedAudio = await preprocessingAudioFile(audioFile.buffer); //(await getMetadata(audioFile.buffer)) as number;

      if (!preprocessedAudio)
        throw new BadRequestException(
          `Failed preprocessing audio with name ${audioFile.filename}`,
        );

      await this.fileService.upload(
        preprocessedAudio.buffer,
        trackFileKey,
        audioFile.mimetype,
      );

      const duration = preprocessedAudio.metadata.duration!;

      tracksData.push({
        uid: trackUID,
        title: trackTitle,
        audio: trackFileKey,
        poster: posterFileKey,
        duration: duration,
        author: { connect: { id: data.authorId } },
        genres: {
          connect: genres.map((id) => ({ id: Number(id) })),
        },
      });
    }

    const album = await this.prismaService.album.create({
      data: {
        uid: uid,
        title: data.title,
        authorId: data.authorId,
        poster: posterFileKey,
        tracks: {
          create: tracksData,
        },
        genres: { connect: genres.map((id) => ({ id: Number(id) })) },
      },
    });

    return album;
  }

  async delete(id: number) {
    const existAlbum = await this.album({ where: { id: id } });

    if (!existAlbum) throw new BadRequestException(ERRORS.noExistAlbum(id));

    const tracksFromAlbum = await this.prismaService.track.findMany({
      where: { albumId: id },
    });

    const deleteAlbum = this.prismaService.album.delete({ where: { id: id } });
    const deleteTracksFromAlbum = this.prismaService.track.deleteMany({
      where: { albumId: id },
    });

    await this.fileService.remove([
      ...tracksFromAlbum.map((track) => track.audio),
      tracksFromAlbum[0].poster,
    ]);

    return this.prismaService.$transaction([
      deleteTracksFromAlbum,
      deleteAlbum,
    ]);
  }
}
