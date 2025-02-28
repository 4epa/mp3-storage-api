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
import { QueryPaginationDto } from 'src/dto';
import { CreateTrackDTO } from './dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('new')
  async getNewTracks(@Query() query: QueryPaginationDto) {
    const { take, skip, cursorId } = query;

    return this.trackService.tracks({
      take: take,
      skip: skip,
      orderBy: { createdAt: 'desc' },
      ...(cursorId && { cursor: { id: cursorId } }),
    });
  }

  @Get('reacted')
  @UseGuards(JWTAuthGuard)
  async getReactedTracks(
    @AuthUser() user: User,
    @Query() query: QueryPaginationDto,
  ) {
    const { take, skip, cursorId } = query;

    const params = {
      skip: skip,
      take: take,
      ...(cursorId && { cursor: { id: cursorId } }),
    };

    return this.trackService.getReactedTracks({
      userId: user.id,
      params: params,
    });
  }

  @Get('playlist/:id')
  async getTracksByPlaylist(
    @Param('id') id: string,
    @Query() query: QueryPaginationDto,
  ) {
    const { take, skip, cursorId } = query;

    return this.trackService.tracks({
      skip: skip,
      take: take,
      orderBy: { createdAt: 'desc' },
      ...(cursorId && { cursor: { id: cursorId } }),
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
    @Query() query: QueryPaginationDto,
  ) {
    const { take, skip, cursorId } = query;

    return this.trackService.tracks({
      skip: skip,
      take: take,
      ...(cursorId && { cursor: { id: cursorId } }),
      where: { albumId: Number(id) },
    });
  }

  @Post('create')
  @Role('ARTIST')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        poster: { type: 'string', format: 'binary' },
        audio: { type: 'string', format: 'binary' },
        title: { type: 'string', format: 'text' },
        genresId: { type: 'string', format: 'text' },
      },
    },
  })
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
    @Body() body: CreateTrackDTO,
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
