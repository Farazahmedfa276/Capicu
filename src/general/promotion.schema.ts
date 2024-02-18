import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PromotionDocument = Promotion & Document;

@Schema()
export class Promotion {
  @Prop()
  promotion_status: number;

  @Prop()
  launch_date: Date;

  @Prop()
  discount: number;

  @Prop()
  promotion_polygon_status: number;

 
  @Prop()
  polygon_discount: number;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
