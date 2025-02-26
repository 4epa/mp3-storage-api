import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ActiveUserResponseDTO, PublicUserResponseDTO } from './dto';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { AuthUser } from '../auth/auth.decorator';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user-by-id/:id')
  async getUser(
    @Param('id') id: string,
  ): Promise<null | PublicUserResponseDTO> {
    return this.userService.publicUser({ id: Number(id) });
  }

  @Get('all-users')
  async getAllUsers(
    @Body()
    params: {
      skip?: number;
      take?: number;
      cursor?: { email: string };
    },
  ): Promise<PublicUserResponseDTO[]> {
    return this.userService.users(params);
  }

  @Get('all-authors')
  async getAllAuthors(
    @Body()
    params: {
      skip?: number;
      take?: number;
      cursor?: { id: number };
    },
  ): Promise<PublicUserResponseDTO[]> {
    return this.userService.users({ ...params, where: { role: 'ARTIST' } });
  }

  @Post('update')
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Body() input: { nickname: string; email: string },
    @AuthUser() user: User,
    @UploadedFile() avatar?: Express.Multer.File,
  ): Promise<ActiveUserResponseDTO> {
    return this.userService.updateUser({
      avatar: avatar,
      input: input,
      where: { id: user.id, uid: user.uid },
    });
  }

  @Post('delete')
  @UseGuards(JWTAuthGuard)
  async deleteUser(@AuthUser() user: User): Promise<ActiveUserResponseDTO> {
    return this.userService.deleteUser({ id: user.id });
  }

  @Get('test')
  @UseGuards(JWTAuthGuard)
  async test() {
    return true;
  }
}
