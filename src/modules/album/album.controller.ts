import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { Role } from 'src/guards/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { AuthUser } from '../auth/auth.decorator';
import { User } from '@prisma/client';
import { AlbumService } from './album.service';
import { Content } from 'src/guards/decorators/content.decorator';
import { AuthorGuard } from 'src/guards/author.guard';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get('new')
  async getNewAlbums(
    @Body()
    params: {
      skip?: number;
      take?: number;
      limit?: number;
      cursor?: { id: number };
    },
  ) {
    return this.albumService.albums({
      ...params,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('album-by-uid/:uid')
  async getAlbumByUID(@Param('uid') uid: string) {
    return this.albumService.album({ where: { uid: uid } });
  }

  @Get('album-by-author/:id')
  async getAuthorAlbums(
    @Param('id')
    id: string,
    @Body()
    params: {
      skip?: number;
      take?: number;
      limit?: number;
      cursor?: { id: number };
    },
  ) {
    return this.albumService.albums({
      ...params,
      where: { authorId: Number(id) },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('create')
  @Role('ARTIST')
  @UseGuards(JWTAuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'poster' }, { name: 'audios' }]),
  )
  async createAlbum(
    @UploadedFiles()
    files: { poster: Express.Multer.File[]; audios: Express.Multer.File[] },
    @Body() body: { title: string; trackTitles: string; genresId: string },
    @AuthUser() user: User,
  ) {
    return this.albumService.create({
      title: body.title,
      trackTitles: body.trackTitles,
      genresId: body.genresId,
      authorId: user.id,
      poster: files.poster[0],
      trackAudios: files.audios,
    });
  }

  @Post('delete/:id')
  @Role('ARTIST')
  @Content('ALBUM')
  @UseGuards(JWTAuthGuard, RoleGuard, AuthorGuard)
  async deleteTrack(@Param('id') id: string) {
    return this.albumService.delete(Number(id));
  }
}
