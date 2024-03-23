import { IsNotEmpty, IsString } from 'class-validator';

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
