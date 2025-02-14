import { SetMetadata } from '@nestjs/common';

export const CONTENT_KEY = 'content';
export const Content = (content: 'TRACK' | 'ALBUM' | 'PLAYLIST') =>
  SetMetadata(CONTENT_KEY, content);
