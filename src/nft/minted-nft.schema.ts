import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NFTCategory } from './constants/nft-category.enum';
import { NFTType } from './constants/nft-type.enum';

export type MintedNFTDocument = MintedNFT & Document;

@Schema()
export class MintedNFT {
  @Prop()
  userId: string;

  @Prop()
  tokenId: number;

  @Prop()
  price: string;

  @Prop()
  tokenUri: string;

  @Prop()
  type: NFTType;

  @Prop()
  category: NFTCategory;

  @Prop()
  isCompleted: boolean;

  @Prop()
  nftType:string;

  @Prop()
  createdAt: Date;

  @Prop()
  hash:string

  @Prop()
  network:string

  @Prop({default:new Date()})
  creatdeAt:Date

}

export const MintedNFTSchema = SchemaFactory.createForClass(MintedNFT);
