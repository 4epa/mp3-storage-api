import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user-by-id/:id')
  async getUser(@Param('id') id: string): Promise<null | User> {
    return this.userService.user({ id: Number(id) });
  }

  @Get('all-users')
  async getAllUsers(
    @Body()
    params: {
      skip?: number;
      take?: number;
      cursor?: { email: string };
    },
  ): Promise<User[]> {
    return this.userService.users(params);
  }

  @Post('create-user')
  async createUser(
    @Body()
    input: {
      name: string;
      email: string;
    },
  ): Promise<User> {
    return this.userService.createUser(input);
  }

  @Post('update-user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() input: { name: string; email: string },
  ): Promise<User> {
    return this.userService.updateUser({
      input: input,
      where: { id: Number(id) },
    });
  }

  @Post('delete/:id')
  async deleteUser(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUser({ id: Number(id) });
  }
}
