import { IsJWT } from 'class-validator';

export class EmailVerificationQueryDto {
  @IsJWT()
  token: string;
}
