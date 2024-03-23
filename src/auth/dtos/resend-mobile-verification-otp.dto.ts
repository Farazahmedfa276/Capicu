import { IsNotEmpty, IsString } from 'class-validator';

export class resendMobileVerificationCodeDto {
  @IsString()
  @IsNotEmpty()
  email: string;

}
