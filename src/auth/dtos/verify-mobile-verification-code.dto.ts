import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class verifyMobileVerificationCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @Transform(({ value }) => (value as string).toLowerCase())
  @IsEmail()
  email: string;
}
