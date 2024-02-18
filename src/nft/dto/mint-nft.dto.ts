import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MintNFTDto {
  @IsNumber({}, { each: true })
  tokenIds: Array<number>;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  tokenUris: Array<string>;

  // @IsString({ each: true })
  // @IsNotEmpty({ each: true })
  // price: Array<string>;

  @IsArray()
  nftClass:Array<string>;

  @IsString()
  nftType:string

  @IsString()
  hash:string

  @IsString()
  network:string

}
