import {
  Controller,
  UploadedFiles,
  Post,
  UseInterceptors,
  Body,
  UseGuards,
  Param,
  Get,
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

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('new')
  async getNewTracks(
    @Body()
    params: {
      skip?: number;
      take?: number;
      limit?: number;
      cursor?: { id: number };
    },
  ) {
    return this.trackService.tracks({
      ...params,
      orderBy: { createdAt: 'desc' },
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
    @UploadedFiles()
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
  async deleteTrack(@Param('id') id: string, @AuthUser() user: User) {
    const activeUser = user;

    return this.trackService.deleteTrack({
      trackId: Number(id),
      authorId: activeUser.id,
    });
  }
}
