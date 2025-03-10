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
import { GenreModule } from './modules/genre/genre.module';
import { GenreController } from './modules/genre/genre.controller';
import { GenreService } from './modules/genre/genre.service';
import { PlaylistModule } from './modules/playlist/playlist.module';
import { AlbumModule } from './modules/album/album.module';
import { AlbumController } from './modules/album/album.controller';
import { AlbumService } from './modules/album/album.service';
import { ReactionModule } from './modules/reaction/reaction.module';
import { ReactionService } from './modules/reaction/reaction.service';
import { ReactionController } from './modules/reaction/reaction.controller';

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
    GenreModule,
    PlaylistModule,
    AlbumModule,
    ReactionModule,
  ],
  controllers: [
    AppController,
    UserController,
    TrackController,
    GenreController,
    AlbumController,
    ReactionController,
  ],
  providers: [
    AppService,
    UserService,
    TrackService,
    AuthService,
    JwtStrategy,
    GenreService,
    AlbumService,
    ReactionService,
  ],
})
export class AppModule {}
