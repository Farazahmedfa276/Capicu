import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class GetCategoriesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  gender: number;
}
