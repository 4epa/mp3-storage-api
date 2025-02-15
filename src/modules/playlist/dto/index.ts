export class CreatePlaylistDTO {
  title: string;
  authorId: number;
  genresId: number[];
  poster: Express.Multer.File;
}
