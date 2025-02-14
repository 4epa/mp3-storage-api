import { Param, Controller, Post, Get, UseGuards, Body } from '@nestjs/common';
import { GenreService } from './genre.service';
import { Role } from 'src/guards/decorators/role.decorator';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get('get-by-uid/:uid')
  async getGenreByUID(@Param('uid') uid: string) {
    return this.genreService.genreByUID(uid);
  }

  @Get('get-many')
  async getGenres(
    @Body() data: { skip?: number; limit?: number; cursor?: { id: number } },
  ) {
    return this.genreService.genres(data);
  }

  @Post('create')
  @Role('MODERATOR')
  @UseGuards(JWTAuthGuard, RoleGuard)
  async createGenre(@Body() data: { name: string }) {
    return this.genreService.create(data.name);
  }

  @Post('update/:id')
  @Role('MODERATOR')
  @UseGuards(JWTAuthGuard, RoleGuard)
  async updateGenre(@Param('id') id: string, @Body() data: { name: string }) {
    return this.genreService.update(Number(id), data.name);
  }

  @Post('delete/:id')
  @Role('MODERATOR')
  @UseGuards(JWTAuthGuard, RoleGuard)
  async deleteGenre(@Param('id') id: string) {
    return this.genreService.delete(Number(id));
  }
}
