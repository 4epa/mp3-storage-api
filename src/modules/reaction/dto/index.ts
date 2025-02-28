import { IsNumber, IsString } from 'class-validator';

export class ManageReactionDTO {
  @IsNumber()
  trackId?: number;

  @IsNumber()
  albumId?: number;

  @IsNumber()
  playlistId?: number;

  @IsString()
  contentType: 'PLAYLIST' | 'ALBUM' | 'TRACK';
}
