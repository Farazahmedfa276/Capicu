import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Gender } from '../../global/constants/gender.enum';

export class CoinExchangeDto {


  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  coin: number;

  @IsNotEmpty()
  @IsString()
  network:string

  // @Transform(() => { new Date() })
  @IsDate()
  exchangeDate: Date;

}
