import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateUUID } from 'src/utils/generateUUID';
import { FileService } from '../file/file.service';
import { CreatePlaylistDTO } from './dto';
import { ERRORS } from './errors';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlaylistService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly fileService: FileService,
  ) {}

  async playlists(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PlaylistWhereUniqueInput;
    where?: Prisma.PlaylistWhereInput;
    orderBy?: Prisma.PlaylistOrderByWithRelationInput;
  }) {
    return this.prismaService.playlist.findMany({ ...params });
  }

  async managePlaylistTrack(playlistId: number, trackId: number) {
    const existPlaylist = await this.prismaService.playlist.findFirst({
      where: { id: playlistId },
      include: {
        tracks: true,
      },
    });

    if (!existPlaylist)
      throw new BadRequestException(ERRORS.noExistsPlaylist(playlistId));

    if (existPlaylist.tracks.find((track) => track.id === trackId)) {
      const updatePlaylist = await this.prismaService.playlist.update({
        where: { id: playlistId },
        data: { tracks: { disconnect: { id: trackId } } },
      });

      return { playlist: updatePlaylist, action: 'remove track' };
    } else {
      const updatePlaylist = await this.prismaService.playlist.update({
        where: { id: playlistId },
        data: { tracks: { connect: { id: trackId } } },
      });

      return { playlist: updatePlaylist, action: 'add track' };
    }
  }

  async create(data: CreatePlaylistDTO) {
    const uid = generateUUID();

    const posterFileKey = `playlist-${data.authorId}-${uid}`;

    await this.fileService.upload(
      data.poster.buffer,
      posterFileKey,
      data.poster.mimetype,
    );

    return this.prismaService.playlist.create({
      data: {
        uid: uid,
        title: data.title,
        poster: posterFileKey,
        authorId: data.authorId,
        genres: { connect: data.genresId.map((id) => ({ id: id })) },
      },
    });
  }

  async delete(id: number) {
    const existPlaylist = await this.prismaService.playlist.findFirst({
      where: { id: id },
    });

    if (!existPlaylist)
      throw new BadRequestException(ERRORS.noExistsPlaylist(id));

    await this.fileService.remove([existPlaylist.poster]);

    return this.prismaService.playlist.delete({ where: { id: id } });
  }

  async checkAuthor(playlistId: number, authorId: number): Promise<boolean> {
    const existPlaylist = await this.prismaService.playlist.findFirst({
      where: { id: playlistId },
    });

    return existPlaylist?.authorId === authorId;
  }
}
