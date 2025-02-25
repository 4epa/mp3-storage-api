export class ManageReactionDTO {
  userId: number;
  trackId?: number;
  albumId?: number;
  playlistId?: number;
  contentType: 'PLAYLIST' | 'ALBUM' | 'TRACK';
}
