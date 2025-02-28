import { Role } from '@prisma/client';
import { Expose } from 'class-transformer';

export class PublicUserResponseDTO {
  @Expose()
  id: number;

  @Expose()
  uid: string;

  @Expose()
  nickname: string;

  @Expose()
  role: Role;

  @Expose()
  avatar?: string | null;
}

export class ActiveUserResponseDTO extends PublicUserResponseDTO {
  @Expose()
  email: string;
}
