import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AssetPriceDocument = AssetPrice & Document;

@Schema()
export class AssetPrice {
  @Prop()
  class: string;

  @Prop()
  price: number;

  @Prop({})
  image:string;

  
}

export const AssetPriceSchema = SchemaFactory.createForClass(AssetPrice);
