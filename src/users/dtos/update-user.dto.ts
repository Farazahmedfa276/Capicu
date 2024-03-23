import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { Gender } from '../../global/constants/gender.enum';

export class UpdateUserDto {
 
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName: string;
 
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  @IsDate()
  dateOfBirth: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  flagShortCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  country: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePicUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultAvatarUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @IsPositive()
  level: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  metaMaskWalletAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  tokenURI:[]
}
