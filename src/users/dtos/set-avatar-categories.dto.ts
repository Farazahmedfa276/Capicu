import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Gender } from '../../global/constants/gender.enum';

class AvatarCategoryItemsMemberDto {
  @ValidateIf((object, value) => value !== null)
  @IsString()
  itemID: string | null;

  @IsString()
  url: string;

  @IsString()
  value: string;

  @IsString()
  thumbnailURL: string;
}

class AvatarCategoryItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvatarCategoryItemsMemberDto)
  texture: Array<AvatarCategoryItemsMemberDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvatarCategoryItemsMemberDto)
  mesh: Array<AvatarCategoryItemsMemberDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvatarCategoryItemsMemberDto)
  color: Array<AvatarCategoryItemsMemberDto>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvatarCategoryItemsMemberDto)
  blend: Array<AvatarCategoryItemsMemberDto>;
}

class AvatarCategoryDto {
  @IsString()
  @IsNotEmpty()
  _id: string;

  @IsString()
  @IsNotEmpty()
  shortCode: string;

  @ValidateNested()
  @Type(() => AvatarCategoryItemsDto)
  data: AvatarCategoryItemsDto;
}

export class SetAvatarCategoriesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvatarCategoryDto)
  avatarCategories: Array<AvatarCategoryDto>;

  @IsEnum(Gender)
  @IsOptional()
  avatarGender: Gender;
}
