import { IsString } from 'class-validator';

export class CreateAlbumDTO {
  @IsString()
  title: string;

  @IsString()
  trackTitles: string;

  @IsString()
  genresId: string;
}
