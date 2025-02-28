import { IsString } from 'class-validator';

export class CreatePlaylistDTO {
  @IsString()
  title: string;

  @IsString()
  genresId: string;
}
