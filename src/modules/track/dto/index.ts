import { IsString } from 'class-validator';

export class CreateTrackDTO {
  @IsString()
  title: string;

  @IsString()
  genresId: string;
}
