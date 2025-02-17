import { Module } from '@nestjs/common';
import { AlbumController } from './album.controller';
import { AlbumService } from './album.service';
import { PrismaModule } from '../prisma/prisma.module';
import { FileService } from '../file/file.service';

@Module({
  imports: [PrismaModule],
  controllers: [AlbumController],
  providers: [AlbumService, FileService],
  exports: [AlbumService],
})
export class AlbumModule {}
