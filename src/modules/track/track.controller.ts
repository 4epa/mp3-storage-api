import {
  Controller,
  UploadedFiles,
  Post,
  UseInterceptors,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { User } from '@prisma/client';
import { AuthUser } from '../auth/auth.decorator';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Post('create')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'audio', maxCount: 1 },
    ]),
  )
  async createTrack(
    @UploadedFiles()
    files: { poster: Express.Multer.File[]; audio: Express.Multer.File[] },
    @Body() body: { title: string },
    @AuthUser() user: User,
  ) {
    const data = {
      poster: files.poster[0],
      audio: files.audio[0],
      title: body.title,
      authorId: user.id,
    };

    return this.trackService.createTrack(data);
  }

  @Post('delete/:id')
  @UseGuards(JWTAuthGuard)
  async deleteTrack(@Param('id') id: string, @AuthUser() user: User) {
    const activeUser = user;

    return this.trackService.deleteTrack({
      trackId: Number(id),
      authorId: activeUser.id,
    });
  }
}
