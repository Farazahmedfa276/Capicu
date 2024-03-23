import { IsNotEmpty, IsString } from 'class-validator';

export class BinanceSignInDto {
  @IsString()
  @IsNotEmpty()
  binanceWalletAddress: string;
}
