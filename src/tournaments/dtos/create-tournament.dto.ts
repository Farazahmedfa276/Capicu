import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  MinDate,
  Validate,
} from 'class-validator';
import { DominoTileColor } from '../constants/domino-tile-color.enum';
import { TournamentEnvironmentFloor } from '../constants/tournament-environment-floor.enum';
import { TournamentRules } from '../constants/tournament-rules.enum';
import { TournamentTableTexture } from '../constants/tournament-table-texture.enum';
import { StartDateValidation } from '../validators/registration-start.validator';
import { CustomDateValidation } from '../validators/start-date.validator';


export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  gameCenter: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsPositive()
  @Min(2)
  @Max(4)
  noOfPlayers: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(4)
  noOfStages: number;

  // @IsOptional()
  // @Transform(({ value }) => new Date(value))
  // @MinDate(new Date())
  // @IsDate()
  // scheduleDate: Date;

  @Transform(({ value }) => {
    return new Date(value)
  })
  @MinDate(new Date())
  @IsDate()
  @Validate(StartDateValidation)
  registrationStartDate: Date;

  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  @IsDate()
  registrationEndDate: Date;

  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  @IsDate()
  @Validate(CustomDateValidation)
  tournamentStartDate: Date;

  @IsNumber()
  @IsPositive()
  entryFee: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  prizePool: number;

  // @IsEnum(TournamentRules)
  // rule: TournamentRules;

  @IsString()
  rule:string

  @IsEnum(TournamentTableTexture)
  @IsOptional()
  tableTexture: TournamentTableTexture;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo: string;

  @IsOptional()
  @IsEnum(DominoTileColor)
  dominoTileColor: DominoTileColor;

  @IsEnum(TournamentEnvironmentFloor)
  @IsOptional()
  environmentFloor: TournamentEnvironmentFloor;

  @Transform(() => new Date())
  @IsDate()
  @IsOptional()
  createdAt : Date
}
