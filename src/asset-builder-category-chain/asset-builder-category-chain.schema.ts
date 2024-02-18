import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IAssetBuilderCategoryChainAttributesData } from './asset-builder-category-chain-attributes.interface';
import { Document } from 'mongoose';

export type AssetBuilderCategoryChainDocument = AssetChain & Document;

@Schema({ collection: 'assetschaindatas' })
export class AssetChain {
  @Prop()
  name: string;

  @Prop()
  asset_id: string;

  @Prop()
  description: string;

  @Prop()
  price: string;

  @Prop()
  image: string;

  @Prop()
  itemCode: string;

  @Prop({ type: Array })
  attributes: IAssetBuilderCategoryChainAttributesData;

  @Prop({ type: Object })
  asset_category: object;
}

export const AssetsChainDataSchema = SchemaFactory.createForClass(AssetChain);
