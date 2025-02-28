import { IsOptional, IsNumber } from 'class-validator';

export class QueryPaginationDto {
  @IsOptional()
  @IsNumber()
  skip?: number;

  @IsOptional()
  @IsNumber()
  take?: number;

  @IsOptional()
  @IsNumber()
  cursorId?: number;
}
