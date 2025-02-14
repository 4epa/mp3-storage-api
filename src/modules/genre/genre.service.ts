import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { generateUUID } from 'src/utils/generateUUID';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GenreService {
  constructor(private readonly prismaService: PrismaService) {}

  async genreByUID(uid: string) {
    return this.prismaService.genre.findFirst({ where: { uid: uid } });
  }

  async genres(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.GenreWhereUniqueInput;
    where?: Prisma.GenreWhereInput;
    orderBy?: Prisma.GenreOrderByWithRelationInput;
  }) {
    return this.prismaService.genre.findMany({ ...params });
  }

  async create(name: string) {
    const uid = generateUUID();

    return this.prismaService.genre.create({ data: { uid: uid, name: name } });
  }

  async update(id: number, name: string) {
    return this.prismaService.genre.update({
      where: { id: id },
      data: { name: name },
    });
  }

  async delete(id: number) {
    return this.prismaService.genre.delete({ where: { id: id } });
  }
}
