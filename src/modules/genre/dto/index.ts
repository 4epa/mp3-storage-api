import { IsString } from 'class-validator';

export class CreateGenreDTO {
  @IsString()
  name: string;
}
