import {
  Controller,
  UploadedFiles,
  Body,
  Post,
  UseGuards,
  Param,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { AuthUser } from '../auth/auth.decorator';
import { User } from '@prisma/client';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { AuthorGuard } from 'src/guards/author.guard';
import { Content } from 'src/guards/decorators/content.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get('new')
  async getNewPlaylists(
    @Body()
    params: {
      skip?: number;
      take?: number;
      limit?: number;
      cursor?: { id: number };
    },
  ) {
    return this.playlistService.playlists({
      ...params,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('create')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'poster', maxCount: 1 }]))
  async createPlaylist(
    @UploadedFiles()
    files: { poster: Express.Multer.File[] },
    @Body() body: { title: string; genresId: string },
    @AuthUser() user: User,
  ) {
    const data = {
      title: body.title,
      authorId: user.id,
      poster: files.poster[0],
      genresId: body.genresId.split(',').map((id) => Number(id)) ?? [],
    };

    return this.playlistService.create(data);
  }

  @Post('delete/:id')
  @Content('PLAYLIST')
  @UseGuards(JWTAuthGuard, AuthorGuard)
  async deleteTrack(@Param('id') id: string) {
    return this.playlistService.delete(Number(id));
  }

  @Post('manage-track/:id')
  @UseGuards(JWTAuthGuard, AuthorGuard)
  async managePlaylistTrack(
    @Param('id') id: string,
    @Body() data: { trackId: number },
  ) {
    return this.playlistService.managePlaylistTrack(Number(id), data.trackId);
  }
}
