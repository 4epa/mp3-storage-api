export class CreateTrackDTO {
  poster: Express.Multer.File;
  audio: Express.Multer.File;
  title: string;
  authorId: number;
  albumId?: number;
}
