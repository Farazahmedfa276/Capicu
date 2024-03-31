import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  authProvider: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @Transform(({ value }) => (value as string).toLowerCase())
  @IsEmail({}, { message: 'Invalid Email or Password' })
  email: string;

}
