import { Module } from '@nestjs/common';
import { PlaylistController } from './playlist.controller';
import { PlaylistService } from './playlist.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FileService } from '../file/file.service';

@Module({
  imports: [PrismaModule],
  controllers: [PlaylistController],
  providers: [PlaylistService, FileService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
