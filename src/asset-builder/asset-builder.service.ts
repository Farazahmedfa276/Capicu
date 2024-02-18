import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AssetBuilderCategory,
  AssetBuilderCategoryDocument,
} from './asset-builder-category.schema';
import { AssetPrice, AssetPriceDocument } from './asset-price.schema';
import { GetCategoriesQueryDto } from './dtos/get-categories-query.dto';

@Injectable()
export class AssetBuilderService {
  constructor(
    @InjectModel(AssetBuilderCategory.name)
    private assetBuilderCategoryModel: Model<AssetBuilderCategoryDocument>,
    @InjectModel(AssetPrice.name)
    private assetPriceModel: Model<AssetPriceDocument>,
  ) {}

  async getCategories(query: GetCategoriesQueryDto) {
    return await this.assetBuilderCategoryModel.find(
      { gender: query.gender ? 'male' : 'female' },
      { item: 0 },
    );
  }

  async updateAsset(){

    let asset_category = await this.assetBuilderCategoryModel.find({'item':{'$exists':true}});

    // console.log('asset_category-->',asset_category);

    asset_category.map(async(asset)=>{

      // console.log('asset-->',asset);
      let price_array = asset.item.map(async(item)=>{

        let className = item.itemClass.split('_');

        let classNameValue = className[className.length - 1]

        item.itemClass = 'asset_class_'+classNameValue
        // console.log('item-->',item);
        return item;

      })

      let data = await Promise.all(price_array);

      await this.assetBuilderCategoryModel.updateOne({_id:asset._id},{
        $set:{'item':data}
      })


    })


  }


  

  async getCategoriesByItems(id) {
    
    let asset_category = await this.assetBuilderCategoryModel.findOne({'_id':id});

    let asset_category_item = asset_category!.item.map(async(item)=>{

      let price = await this.assetPriceModel.findOne({'class':item.itemClass});

      if(price){
        item['itemPrice']['usdt'] = price.price
      }

      return item;

    })

    let data = await Promise.all(asset_category_item);

    // console.log(data[0])
    asset_category.item = data;
    return asset_category;


  }

  async getListing(query) {
    // console.log('query-->', query);
  }

  async getDefaultAssets() {
    const maleDefaultAsset = await this.assetBuilderCategoryModel.find(
      { gender: 'male' },
      {
        item: { $slice: 1 },
      },
    );

    const femaleDefaultAsset = await this.assetBuilderCategoryModel.find(
      { gender: 'female' },
      {
        item: { $slice: 1 },
      },
    );

    return { maleDefaultAsset, femaleDefaultAsset };
  }
}
