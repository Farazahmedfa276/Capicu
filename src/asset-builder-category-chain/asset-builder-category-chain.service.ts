import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssetBuilderCategory,
  AssetBuilderCategoryDocument,
} from 'src/asset-builder/asset-builder-category.schema';
import { AssetBuilderCategoryChainDocument } from './asset-builder-category-chain.schema';

@Injectable()
export class AssetBuilderCategoryChainService {
  constructor(
    @InjectModel('assetschaindatas')
    private assetBuilderCategoryChainModel: Model<AssetBuilderCategoryChainDocument>,
    @InjectModel(AssetBuilderCategory.name)
    private assetBuilderCategoryModel: Model<AssetBuilderCategoryDocument>,
  ) {}

  async getListing(query) {
    const current_page = query.page;

    const offset = query.limit * current_page - query.limit;

    const limit = query.limit;

    let mongo_query = {};

    if (query.search) {
      mongo_query['name'] = { $regex: query.search };
    }

    let total_count = await this.assetBuilderCategoryChainModel.count({});

    let data_count = await this.assetBuilderCategoryChainModel
      .count(mongo_query)
      .skip(offset)
      .limit(limit);

    let asset_items = await this.assetBuilderCategoryChainModel
      .find(mongo_query)
      .skip(offset)
      .limit(limit);

    let asset_items_data = asset_items.map(async (item) => {
      let asset_category = await this.assetBuilderCategoryModel.findOne(
        {'_id':item.asset_id}
      );

      item['asset_category'] = asset_category;

      return item;
    });

    let data = await Promise.all(asset_items_data);

    return { data, total_count, current_page, limit };
  }

  async getItemById(id) {
    let item = await this.assetBuilderCategoryChainModel.findOne({'_id':id});

    if (!item) {
      throw 'Item does not exist';
    }

    return item;
  }
}
