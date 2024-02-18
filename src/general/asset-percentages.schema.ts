import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AssetPercentageDocument = AssetPercentage & Document;

@Schema()
export class AssetPercentage {
  @Prop()
  class: string;

  @Prop()
  percentage: number;

  @Prop()
  type:string
}

export const AssetPercentageSchema = SchemaFactory.createForClass(AssetPercentage);
