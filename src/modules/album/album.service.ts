import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateUUID } from 'src/utils/generateUUID';
import { CreateAlbumDTO } from './dto';
import { getMetadata } from 'src/utils/GetMetadata';
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

      const trackDuration = (await getMetadata(audioFile.buffer)) as number;

      await this.fileService.upload(
        audioFile.buffer,
        trackFileKey,
        audioFile.mimetype,
      );

      tracksData.push({
        uid: trackUID,
        title: trackTitle,
        audio: trackFileKey,
        poster: posterFileKey,
        duration: trackDuration,
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
