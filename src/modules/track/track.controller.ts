import {
  Controller,
  UploadedFiles,
  Post,
  UseInterceptors,
  Body,
  UseGuards,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { User } from '@prisma/client';
import { AuthUser } from '../auth/auth.decorator';
import { Role } from 'src/guards/decorators/role.decorator';
import { RoleGuard } from 'src/guards/role.guard';
import { Content } from 'src/guards/decorators/content.decorator';
import { AuthorGuard } from 'src/guards/author.guard';
import { ParseFilesPipe } from './validations';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('new')
  async getNewTracks(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: number,
  ) {
    return this.trackService.tracks({
      take: take,
      skip: skip,
      cursor: { id: cursorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('reacted')
  @UseGuards(JWTAuthGuard)
  async getReactedTracks(
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

    return this.trackService.getReactedTracks({
      userId: user.id,
      params: query,
    });
  }

  @Get('playlist/:id')
  async getTracksByPlaylist(
    @Param('id') id: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: number,
  ) {
    return this.trackService.tracks({
      skip: skip,
      take: take,
      cursor: { id: cursorId },
      orderBy: { createdAt: 'desc' },
      where: {
        playlist: {
          some: { id: Number(id) },
        },
      },
    });
  }

  @Get('album/:id')
  async getTracksByAlbum(
    @Param('id') id: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('cursorId') cursorId?: number,
  ) {
    return this.trackService.tracks({
      skip: skip,
      take: take,
      cursor: { id: cursorId },
      where: { albumId: Number(id) },
    });
  }

  @Post('create')
  @Role('ARTIST')
  @UseGuards(JWTAuthGuard, RoleGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
  )
  async createTrack(
    @UploadedFiles(new ParseFilesPipe())
    files: { poster: Express.Multer.File[]; audio: Express.Multer.File[] },
    @Body() body: { title: string; genresId: string },
    @AuthUser() user: User,
  ) {
    const data = {
      authorId: user.id,
      title: body.title,
      audio: files.audio[0],
      poster: files.poster[0],
      genresId: body.genresId.split(',').map((id) => Number(id)) ?? [],
    };

    return this.trackService.createTrack(data);
  }

  @Post('delete/:id')
  @Role('ARTIST')
  @Content('TRACK')
  @UseGuards(JWTAuthGuard, RoleGuard, AuthorGuard)
  async deleteTrack(@Param('id') id: string) {
    return this.trackService.deleteTrack(Number(id));
  }
}
