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
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @Transform(({ value }) => (value as string).toLowerCase())
  @IsEmail({}, { message: 'Invalid Email or Password' })
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsBoolean()
  isTermsOfServiceAndPrivacyPolicyAccepted: boolean;
}
