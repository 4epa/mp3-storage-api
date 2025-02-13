import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { CONTENT_KEY } from './decorators/content.decorator';
import { TrackService } from 'src/modules/track/track.service';

@Injectable()
export class AuthorGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly trackService: TrackService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const content = this.reflector.get<string>(
      CONTENT_KEY,
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;
    const { id } = request.params;

    if (!user || !id) return false;

    switch (content) {
      case 'TRACK':
        return this.trackService.checkAuthor(Number(id), user.id);
      default:
        return true;
    }
  }
}
