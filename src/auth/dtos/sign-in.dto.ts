import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @Transform(({ value }) => (value as string).toLowerCase())
  @IsEmail({}, { message: 'Invalid Email or Password' })
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
