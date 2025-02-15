import { Module } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FileService } from '../file/file.service';
import { TrackService } from '../track/track.service';
import { TrackModule } from '../track/track.module';

@Module({
  imports: [PrismaModule, TrackModule],
  controllers: [PlaylistController],
  providers: [PlaylistService, FileService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
