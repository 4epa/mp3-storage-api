import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ActiveUserResponseDTO, PublicUserResponseDTO } from './dto';
import { JWTAuthGuard } from 'src/guards/auth.guard';

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

  @Post('update-user/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() input: { name: string; email: string },
  ): Promise<ActiveUserResponseDTO> {
    return this.userService.updateUser({
      input: input,
      where: { id: Number(id) },
    });
  }

  @Post('delete/:id')
  async deleteUser(@Param('id') id: string): Promise<ActiveUserResponseDTO> {
    return this.userService.deleteUser({ id: Number(id) });
  }

  @Get('test')
  @UseGuards(JWTAuthGuard)
  async test() {
    return true;
  }
}
