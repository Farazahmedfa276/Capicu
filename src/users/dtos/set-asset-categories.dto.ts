import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Gender } from 'src/global/constants/gender.enum';

class AssetCategoryItemTexUrlsDto {
  @IsString()
  texId: string;

  @IsString()
  texUrl: string;

  @IsString()
  iconUrl: string;
}

class AssetCategoryItemsDto {
  @IsString()
  @IsNotEmpty()
  itemShortCode: string;

  @IsString()
  @IsNotEmpty()
  itemName: string;

  @IsString()
  @IsNotEmpty()
  itemType: string;

  @IsString()
  @IsNotEmpty()
  itemIcon: string;

  @IsString()
  @IsNotEmpty()
  itemDesc: string;

  @IsString()
  @IsNotEmpty()
  itemClass: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetCategoryItemTexUrlsDto)
  itemTexUrls: Array<AssetCategoryItemTexUrlsDto>;

  @ValidateNested({ each: true })
  @Type(() => AssetCategoryItemPriceDto)
  itemPrice: Array<AssetCategoryItemPriceDto>;
}

class AssetCategoryDto {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsString()
  @IsNotEmpty()
  shortCode: string;

  @ValidateNested()
  @Type(() => AssetCategoryItemsDto)
  item: AssetCategoryItemsDto;
}

class AssetCategoryItemPriceDto {
  @IsString()
  @IsNotEmpty()
  chain: string;

  @IsNumber()
  @IsNotEmpty()
  chainPrice: number;

  @IsNumber()
  @IsNotEmpty()
  usdt: number;
}

export class SetAssetCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetCategoryDto)
  @IsOptional()
  assetCategories: Array<AssetCategoryDto>;

  @IsString()
  characterId: string;

  @IsEnum(Gender)
  assetGender: Gender;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssetCategoryDto)
  @IsOptional()
  mintedInventory: Array<AssetCategoryDto>;
}


export class SetMintedCategoryDto{

  @IsEnum(Gender)
  mintedGender: Gender;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MintedInventoryDto)
  mintedInventory: Array<MintedInventoryDto>;

  @IsObject()
  mintedCharacter: object;

  @IsString()
  @IsOptional()
  mintedAvatarName:string;

  @IsString()
  @IsOptional()
  mintedAvatarImageUrl:string;

  @IsString()
  @IsOptional()
  mintedAvatarClass:string;

}


class MintedInventoryDto {
  @IsString()
  @IsOptional()
  tokenId: string;

  @IsString()
  uri: string;

}