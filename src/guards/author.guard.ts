import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { CONTENT_KEY } from './decorators/content.decorator';
import { PrismaService } from 'src/modules/prisma/prisma.service';

interface AuthenticatedRequest extends Request {
  user?: User;
  params: {
    id: string;
  };
}

@Injectable()
export class AuthorGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const content = this.reflector.get<string>(
      CONTENT_KEY,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user as User;
    const { id } = request.params;

    if (!user || !id) return false;

    if (user.role === 'MODERATOR') return true;

    switch (content) {
      case 'TRACK': {
        const track = await this.prismaService.track.findUnique({
          where: { id: Number(id) },
        });

        return track?.authorId === user.id;
      }
      case 'PLAYLIST': {
        const playlist = await this.prismaService.playlist.findUnique({
          where: { id: Number(id) },
        });

        return playlist?.authorId === user.id;
      }

      case 'ALBUM': {
        const album = await this.prismaService.album.findUnique({
          where: { id: Number(id) },
        });

        return album?.authorId === user.id;
      }
      default:
        return true;
    }
  }
}
