import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Gender } from '../../global/constants/gender.enum';

export class NewsLetterDto {


  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

}
