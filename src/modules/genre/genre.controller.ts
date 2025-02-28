import {
  Param,
  Controller,
  Post,
  Get,
  UseGuards,
  Body,
  Query,
} from '@nestjs/common';
import { GenreService } from './genre.service';
import { Role } from 'src/guards/decorators/role.decorator';
import { JWTAuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { CreateGenreDTO } from './dto';
import { QueryPaginationDto } from 'src/dto';

@Controller('genre')
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  @Get('get-by-uid/:uid')
  async getGenreByUID(@Param('uid') uid: string) {
    return this.genreService.genreByUID(uid);
  }

  @Get('get-many')
  async getGenres(@Query() query: QueryPaginationDto) {
    const { skip, take, cursorId } = query;

    return this.genreService.genres({
      skip,
      take,
      ...(cursorId && { cursor: { id: cursorId } }),
    });
  }

  @Post('create')
  @Role('MODERATOR')
  @UseGuards(JWTAuthGuard, RoleGuard)
  async createGenre(@Body() data: CreateGenreDTO) {
    return this.genreService.create(data.name);
  }

  @Post('update/:id')
  @Role('MODERATOR')
  @UseGuards(JWTAuthGuard, RoleGuard)
  async updateGenre(@Param('id') id: string, @Body() data: CreateGenreDTO) {
    return this.genreService.update(Number(id), data.name);
  }

  @Post('delete/:id')
  @Role('MODERATOR')
  @UseGuards(JWTAuthGuard, RoleGuard)
  async deleteGenre(@Param('id') id: string) {
    return this.genreService.delete(Number(id));
  }
}
