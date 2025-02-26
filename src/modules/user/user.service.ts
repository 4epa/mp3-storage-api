import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { ActiveUserResponseDTO, PublicUserResponseDTO } from './dto';
import { preprocessingImageFile } from 'src/utils/sharp/utils';
import { FileService } from '../file/file.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private file: FileService,
  ) {}

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

  async updateUser(data: {
    avatar?: Express.Multer.File;
    input: Prisma.UserUpdateInput;
    where: Prisma.UserWhereUniqueInput;
  }): Promise<ActiveUserResponseDTO> {
    const existUser = await this.activeUser(data.where);

    if (!existUser)
      throw new BadRequestException(`Not find user with ${data.where.uid} uid`);

    if (data.avatar) {
      const avatarFileKey = `avatar-${existUser.uid}`;

      const preprocessedAvatarFile = await preprocessingImageFile(
        data.avatar.buffer,
      );

      if (!preprocessedAvatarFile)
        throw new BadRequestException('Failed preprocessing avatar file');

      if (existUser.avatar) {
        await this.file.remove([existUser.avatar]);
      }

      await this.file.upload(
        preprocessedAvatarFile?.buffer,
        avatarFileKey,
        preprocessedAvatarFile.mimetype,
      );

      return this.prisma.user.update({
        data: { ...data.input, avatar: avatarFileKey },
        where: data.where,
      });
    }

    return this.prisma.user.update({ data: data.input, where: data.where });
  }

  async deleteUser(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<ActiveUserResponseDTO> {
    return this.prisma.user.delete({ where });
  }
}
