import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { TournamentStatus } from '../constants/tournament-status.enum';

export class GetTournamentsQueryDto {
  @IsInt()
  @IsPositive()
  page: number = 1;

  @IsInt()
  @IsPositive()
  limit: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHostedByDominos: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  searchString: string;

  

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TournamentStatus)
  status: TournamentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  myTournament

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty()
  game_center_id:string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  selectedRule:string
}
