import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { ReactionType } from '@prisma/client';

export class ManageReactionDTO {
  @ApiPropertyOptional()
  @IsNumber()
  trackId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  albumId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  playlistId?: number;

  @ApiProperty({ enum: ReactionType, name: 'ReactionType' })
  @IsString()
  contentType: 'PLAYLIST' | 'ALBUM' | 'TRACK';
}
