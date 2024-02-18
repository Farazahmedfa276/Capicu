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
import { EndDateValidation } from '../validators/registration-end.validator';
import { StartDateValidation } from '../validators/registration-start.validator';
import { CustomDateValidation } from '../validators/start-date.validator';

export class UpdateTournamentDto {
 

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

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @Validate(StartDateValidation)
  registrationStartDate: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @Validate(EndDateValidation)
  registrationEndDate: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @Validate(CustomDateValidation)
  tournamentStartDate: Date;

  @IsNumber()
  @IsPositive()
  entryFee: number;


  @IsString()
  rule: TournamentRules;

}
