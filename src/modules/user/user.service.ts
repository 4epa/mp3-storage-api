import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { ActiveUserResponseDTO, PublicUserResponseDTO } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<null | User> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<PublicUserResponseDTO[]> {
    return this.prisma.user.findMany({
      ...params,
      select: {
        nickname: true,
        id: true,
        uid: true,
        avatar: true,
        role: true,
      },
    });
  }

  async activeUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<null | ActiveUserResponseDTO> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        nickname: true,
        id: true,
        uid: true,
        avatar: true,
        email: true,
        role: true,
      },
    });
  }

  async publicUser(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<null | PublicUserResponseDTO> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      select: {
        nickname: true,
        id: true,
        uid: true,
        avatar: true,
        role: true,
      },
    });
  }

  async createUser(
    input: Prisma.UserCreateInput,
  ): Promise<ActiveUserResponseDTO> {
    return this.prisma.user.create({
      data: input,
      select: {
        nickname: true,
        id: true,
        uid: true,
        avatar: true,
        email: true,
        role: true,
      },
    });
  }

  async updateUser(params: {
    input: Prisma.UserUpdateInput;
    where: Prisma.UserWhereUniqueInput;
  }): Promise<ActiveUserResponseDTO> {
    return this.prisma.user.update({ data: params.input, where: params.where });
  }

  async deleteUser(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<ActiveUserResponseDTO> {
    return this.prisma.user.delete({ where });
  }
}
