import {
  Controller,
  Body,
  Post,
  UseGuards,
  Param,
  Get,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { AuthUser } from '../auth/auth.decorator';
import { User } from '@prisma/client';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { AuthorGuard } from 'src/guards/author.guard';
import { Content } from 'src/guards/decorators/content.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePlaylistDTO } from './dto';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Get('new')
  async getNewPlaylists(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: number,
  ) {
    return this.playlistService.playlists({
      skip: skip,
      take: take,
      cursor: { id: cursorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('reacted')
  @UseGuards(JWTAuthGuard)
  async getReactedPlaylists(
    @AuthUser() user: User,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: number,
  ) {
    const query = {
      skip: skip,
      take: take,
      cursor: { id: cursorId },
    };

    return this.playlistService.getReactedPlaylist({
      userId: user.id,
      params: query,
    });
  }

  @Post('create')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('poster'))
  async createPlaylist(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /^image/ })],
      }),
    )
    poster: Express.Multer.File,
    @Body() body: CreatePlaylistDTO,
    @AuthUser() user: User,
  ) {
    const data = {
      title: body.title,
      authorId: user.id,
      poster: poster,
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
