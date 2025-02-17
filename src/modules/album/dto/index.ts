export class CreateAlbumDTO {
  title: string;
  poster: Express.Multer.File;
  trackAudios: Express.Multer.File[];
  trackTitles: string;
  genresId: string;
  authorId: number;
}
