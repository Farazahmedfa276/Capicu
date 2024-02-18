import { IsNotEmpty, IsString } from 'class-validator';

export class NFTUpdateDto {
  @IsString()
  @IsNotEmpty()
  NFTCategory: string;
}
