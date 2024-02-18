import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IAssetBuilderCategoryData } from './asset-builder-category-data.interface';
import { Document } from 'mongoose';
import { IAssetBuilderCategoryItem } from './asset-builder-item.interface';

export type AssetBuilderCategoryDocument = AssetBuilderCategory & Document;

@Schema()
export class AssetBuilderCategory {
  @Prop()
  name: string;

  @Prop()
  shortCode: string;

  @Prop()
  gender: string;

  @Prop({ type: Object })
  data: IAssetBuilderCategoryData;

  @Prop({ type: Array })
  item: any;
}

export const AssetBuilderCategorySchema =
  SchemaFactory.createForClass(AssetBuilderCategory);
