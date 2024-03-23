import { IsNotEmpty, IsString } from 'class-validator';

export class MetaMaskSignInDto {
  @IsString()
  @IsNotEmpty()
  metaMaskWalletAddress: string;
}
