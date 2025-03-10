import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Get,
  Query,
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
import { CreateAlbumDTO } from './dto';
import { ParseFilesPipe } from './validation';

@Controller('album')
export class AlbumController {
  constructor(private readonly albumService: AlbumService) {}

  @Get('new')
  async getNewAlbums(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: number,
  ) {
    return this.albumService.albums({
      skip: skip,
      take: take,
      cursor: { id: cursorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('reacted')
  @UseGuards(JWTAuthGuard)
  async getReactedAlbums(
    @AuthUser() user: User,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: number,
  ) {
    return this.albumService.getReactedAlbums({
      userId: user.id,
      params: {
        take: take,
        skip: skip,
        cursor: { id: cursorId },
      },
    });
  }

  @Get('by-uid/:uid')
  async getAlbumByUID(@Param('uid') uid: string) {
    return this.albumService.album({ where: { uid: uid } });
  }

  @Get('by-author/:id')
  async getAuthorAlbums(
    @Param('id')
    id: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: number,
  ) {
    return this.albumService.albums({
      skip: skip,
      take: take,
      cursor: { id: cursorId },
      where: { authorId: Number(id) },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('create')
  @Role('ARTIST')
  @UseGuards(JWTAuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'audios', maxCount: 20 },
    ]),
  )
  async createAlbum(
    @Body() body: CreateAlbumDTO,
    @AuthUser() user: User,
    @UploadedFiles(new ParseFilesPipe())
    files: { poster: Express.Multer.File[]; audios: Express.Multer.File[] },
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
