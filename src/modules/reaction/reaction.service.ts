import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { generateUUID } from 'src/utils/generateUUID';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReactionService {
  constructor(private readonly prismaService: PrismaService) {}

  async reactions(params: Prisma.ReactionFindManyArgs) {
    return this.prismaService.reaction.findMany({ ...params });
  }

  async manageReaction(data: {
    userId: number;
    trackId?: number;
    albumId?: number;
    playlistId?: number;
    contentType: 'PLAYLIST' | 'ALBUM' | 'TRACK';
  }) {
    const existReaction = await this.prismaService.reaction.findFirst({
      where: {
        userId: data.userId,
        trackId: data.trackId,
        albumId: data.albumId,
        playlistId: data.playlistId,
        type: data.contentType,
      },
    });

    if (existReaction) {
      const reaction = await this.prismaService.reaction.delete({
        where: { id: existReaction.id },
      });

      return {
        reaction: reaction,
        action: 'delete',
      };
    } else {
      const uid = generateUUID();
      const reaction = await this.prismaService.reaction.create({
        data: {
          uid: uid,
          userId: data.userId,
          trackId: data.trackId,
          albumId: data.albumId,
          playlistId: data.playlistId,
          type: data.contentType,
        },
      });

      return {
        reaction: reaction,
        action: 'create',
      };
    }
  }
}
