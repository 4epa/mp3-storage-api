import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'role';
export const Role = (role: 'MODERATOR' | 'ARTIST' | 'USER') =>
  SetMetadata(ROLE_KEY, role);
