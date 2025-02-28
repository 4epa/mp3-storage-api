import { Get, Post, Controller, UseGuards, Body } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { AuthUser } from '../auth/auth.decorator';
import { User } from '@prisma/client';
import { ManageReactionDTO } from './dto';

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
    body: ManageReactionDTO,
    @AuthUser() user: User,
  ) {
    return this.reactionService.manageReaction({ ...body, userId: user.id });
  }
}
