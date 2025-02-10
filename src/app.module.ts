import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { UserService } from './modules/user/user.service';
import { UserController } from './modules/user/user.controller';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './modules/auth/auth.service';
import { TrackModule } from './modules/track/track.module';
import { TrackController } from './modules/track/track.controller';
import { TrackService } from './modules/track/track.service';
import { FileModule } from './modules/file/file.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.APP_SECRET,
      signOptions: {
        expiresIn: '1d',
        algorithm: 'HS384',
      },
      verifyOptions: {
        algorithms: ['HS384'],
      },
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    TokenModule,
    TrackModule,
    FileModule,
  ],
  controllers: [AppController, UserController, TrackController],
  providers: [AppService, UserService, TrackService, AuthService, JwtStrategy],
})
export class AppModule {}
