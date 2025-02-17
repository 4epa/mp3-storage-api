import { Module } from '@nestjs/common';
import { TrackController } from './track.controller';
import { TrackService } from './track.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FileService } from '../file/file.service';

@Module({
  imports: [PrismaModule],
  controllers: [TrackController],
  providers: [TrackService, FileService],
  exports: [TrackService],
})
export class TrackModule {}
