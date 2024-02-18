import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Mode } from 'fs';
import { Model } from 'mongoose';
import { Gender } from 'src/global/constants/gender.enum';
import {
  AvatarBuilderCategory,
  AvatarBuilderCategoryDocument,
} from './avatar-builder-category.schema';
import { AvatarPrice, AvatarPriceDocument } from './avatar-price.schema';
import { GetCategoriesQueryDto } from './dtos/get-categories-query.dto';

@Injectable()
export class AvatarBuilderService {
  constructor(
    @InjectModel(AvatarBuilderCategory.name)
    private avatarBuilderCategoryModel: Model<AvatarBuilderCategoryDocument>,
    @InjectModel(AvatarPrice.name)
    private avatarPriceModel: Model<AvatarPriceDocument>,
  ) {}

  async getCategories(query: GetCategoriesQueryDto) {
    const { gender } = query;

    return await this.avatarBuilderCategoryModel.find(
      { gender: gender === 0 ? Gender.FEMALE : Gender.MALE },
      { data: 0 },
    );
  }

  async getCategoryItems(id: string) {
    return await this.avatarBuilderCategoryModel.findOne({'_id':id}, { data: 1 });
  }

  async getDefaultMaleAvatar() {
    const { maleDefaultAvatar } = await this.getDefaultAvatars();
    return {
      description: 'Default male avatar',
      image: '',
      name: 'Default Male',
      attributes:{
        message: "minted character",
        avatarCategories: maleDefaultAvatar,
        avatarGender :	"male"
      },
    };
  }

  async getDefaultFemaleAvatar() {
    const { femaleDafaultAvatar } = await this.getDefaultAvatars();
    return {
      description: 'Default female avatar',
      image: '',
      name: 'Default Female',
      attributes:{
        message: "minted character",
        avatarCategories: femaleDafaultAvatar,
        avatarGender :	"female"
      },
    };
  }

  async getDefaultAvatars() {
    const maleDefaultAvatar = await this.avatarBuilderCategoryModel.find(
      { gender: Gender.MALE },
      {
        'data.blend': { $slice: 1 },
        'data.texture': { $slice: 1 },
        'data.color': { $slice: 1 },
        'data.mesh': { $slice: 1 },
      },
    );

    const femaleDafaultAvatar = await this.avatarBuilderCategoryModel.find(
      { gender: Gender.FEMALE },
      {
        'data.blend': { $slice: 1 },
        'data.texture': { $slice: 1 },
        'data.color': { $slice: 1 },
        'data.mesh': { $slice: 1 },
      },
    );

    return { maleDefaultAvatar, femaleDafaultAvatar };
  }

  async getAvatarPrice() {
    const avatarPrice = await this.avatarPriceModel.findOne({});
    return avatarPrice;
  }
}
