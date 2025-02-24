import { Get, Post, Controller, UseGuards, Body } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { AuthUser } from '../auth/auth.decorator';
import { User } from '@prisma/client';

@Controller('reaction')
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Get('my')
  @UseGuards(JWTAuthGuard)
  async getMyReactions(@AuthUser() user: User) {
    return this.reactionService.reactions({ where: { userId: user.id } });
  }

  @Post('manage')
  @UseGuards(JWTAuthGuard)
  async manageReaction(
    @Body()
    body: {
      trackId?: number;
      playlistId?: number;
      albumId?: number;
      contentType: 'TRACK' | 'PLAYLIST' | 'ALBUM';
    },
    @AuthUser() user: User,
  ) {
    return this.reactionService.manageReaction({ ...body, userId: user.id });
  }
}
