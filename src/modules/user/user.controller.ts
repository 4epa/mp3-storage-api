import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
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
import { QueryPaginationDto } from 'src/dto';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user-by-id/:uid')
  async getUser(
    @Param('uid') uid: string,
  ): Promise<null | PublicUserResponseDTO> {
    return this.userService.publicUser({ uid: uid });
  }

  @Get('all-users')
  async getAllUsers(
    @Query() query: QueryPaginationDto,
  ): Promise<PublicUserResponseDTO[]> {
    const { skip, take, cursorId } = query;

    return this.userService.users({
      take: take,
      skip: skip,
      ...(cursorId && { cursor: { id: cursorId } }),
    });
  }

  @Get('all-authors')
  async getAllAuthors(
    @Query() query: QueryPaginationDto,
  ): Promise<PublicUserResponseDTO[]> {
    const { skip, take, cursorId } = query;

    return this.userService.users({
      take: take,
      skip: skip,
      where: { role: 'ARTIST' },
      ...(cursorId && { cursor: { id: cursorId } }),
    });
  }

  @Put('update')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      description: 'Create playlist schema',
      properties: {
        avatar: { type: 'string', format: 'binary' },
        nickname: { type: 'string', format: 'text' },
        email: { type: 'string', format: 'text' },
      },
    },
  })
  @UseGuards(JWTAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Body() input: { nickname: string; email: string },
    @AuthUser() user: User,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /^image/ })],
      }),
    )
    avatar?: Express.Multer.File,
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
}
