import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssetPrice, AssetPriceDocument } from 'src/asset-builder/asset-price.schema';
import { AvatarPrice, AvatarPriceDocument } from 'src/avatar-builder/avatar-price.schema';
import { UserDocument } from 'src/users/user.schema';
import {
  NFTCategory,
  NFTCategoryIdMostSignificantDigit,
  NFTTokenMostSignificantDigitToCategoryMap,
} from './constants/nft-category.enum';
import { MintNFTDto } from './dto/mint-nft.dto';
import { NFTUpdateDto } from './dto/nft-update.dto';
import { MintedNFT, MintedNFTDocument } from './minted-nft.schema';
import { NFTTokenId, NFTTokenIdDocument } from './nft-token-id.schema';

@Injectable()
export class NftService {
  constructor(
    @InjectModel(NFTTokenId.name)
    private nftTokenIdModel: Model<NFTTokenIdDocument>,
    @InjectModel(MintedNFT.name)
    private mintedNFTModel: Model<MintedNFTDocument>,
    @InjectModel(AssetPrice.name)
    private assetPriceModel:Model<AssetPriceDocument>,
    @InjectModel(AvatarPrice.name)
    private avatarPriceModel:Model<AvatarPriceDocument>
  ) {}

  async seedNftTokenId(nftCategory: NFTCategory) {
    const tokenId = await this.nftTokenIdModel.findOne({
      NFTCategory: nftCategory,
    });

    if (tokenId) {
      throw new ConflictException('Already seeded');
    }

    const newTokenId = new this.nftTokenIdModel({
      NFTCategory: nftCategory,
      mostSignificantDigit: NFTCategoryIdMostSignificantDigit[nftCategory],
      currentId: NFTCategoryIdMostSignificantDigit[nftCategory] * 1000,
    });

    await newTokenId.save();
  }

  async getNftTokenId(nftCategories: string) {
    const nftCategoryArray = nftCategories
      .split(',')
      .map((category) => category.trim());

    let NFTCategories = await this.nftTokenIdModel.find({
      NFTCategory: { $in: nftCategoryArray },
    });

    /*
    NFTCategories.forEach((category) => {
      if (
        parseInt((category.currentId + 1).toString()[0]) !==
        category.mostSignificantDigit
      ) { 
        let currentId = `${category.mostSignificantDigit}`;

        category.currentId
          .toString()
          .split('')
          .forEach((_) => {
            currentId = `${currentId}0`;
          });

        category.currentId = parseInt(currentId);
      } else {
        category.currentId = category.currentId + 1;
      }
    });
    */

    const tokenIds = [];

    nftCategoryArray.forEach((category) => {
      const nftCategorie = NFTCategories.find((obj) => obj.NFTCategory === category);

      if (parseInt((nftCategorie.currentId + 1).toString()[0]) !==
        nftCategorie.mostSignificantDigit) {
        let currentId = `${nftCategorie.mostSignificantDigit}`;

        nftCategorie.currentId
          .toString()
          .split('')
          .forEach((_) => {
            currentId = `${currentId}0`;
          });

          nftCategorie.currentId = parseInt(currentId);
      } else {
        nftCategorie.currentId = nftCategorie.currentId + 1;
      }

      tokenIds.push(nftCategorie.currentId);
    });

    await Promise.all(
      NFTCategories.map(async (category) => await category.save()),
    );

    return tokenIds;
  }

  async updateNftTokenId(body: NFTUpdateDto) {
    let nftCategoryArray = body.NFTCategory.split(',');

    await this.nftTokenIdModel.updateOne(
      { NFTCategory: { $in: nftCategoryArray } },
      { $inc: { currentId: 1 } },
    );
  }

  async mintNFT(user: UserDocument, body: MintNFTDto) {
    const { tokenIds, tokenUris,nftClass,nftType } = body;
    
    let prices = await this.getPrices(nftType);
    
    const nfts = tokenIds.map((tokenId, i) => {
      const category =
        NFTTokenMostSignificantDigitToCategoryMap[tokenId.toString()[0]];

        const price = prices[nftClass[i]]
        return {
          userId: user._id,
          tokenId: tokenId,
          price: price || 0,
          tokenUri: tokenUris[i],
          type: category === NFTCategory.AVATAR ? category : 'asset',
          category: category,
          isCompleted: false,
          hash:body.hash,
          network: body.network
        };
    });

    await this.mintedNFTModel.insertMany(nfts);
  }

  async getPrices(nftType:string){

    let prices_array;
    let price_with_class:any = {};

    if(nftType === NFTCategory.AVATAR){
      prices_array = await this.avatarPriceModel.findOne({});
      price_with_class['avatar-female-class-a'] = prices_array.female_price;
      price_with_class['avatar-male-class-a'] = prices_array.male_price;
      
    }
    else{
      prices_array = await this.assetPriceModel.find({},{'class':1,'price':1,'_id':0});
      prices_array.forEach(price=>{
      
        price_with_class[price['class']] = price.price;
      })
    
    }
    
   

    return price_with_class;

  }

  async updateNFTStatus(hash: string) {
    await this.mintedNFTModel.updateMany(
      { hash: hash },
      { $set: { isCompleted: true } },
    );
  }
}
