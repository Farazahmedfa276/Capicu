import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

export class PasswordResetCodeDto {
  @Transform(({ value }) => (value as string).toLowerCase())
  @IsEmail()
  email: string;
}
