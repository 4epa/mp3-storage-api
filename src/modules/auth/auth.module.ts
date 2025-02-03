import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TokenService } from '../token/token.service';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, TokenService],
})
export class AuthModule {}
