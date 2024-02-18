import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type AvatarPriceDocument = AvatarPrice & Document;

@Schema()
export class AvatarPrice {
  @Prop()
  female_price: number;

  @Prop()
  male_price: number;

  @Prop({default:'avatar-female-class-a'})
  female_code:string;

  @Prop({default:'avatar-male-class-a'})
  male_code:string;

  @Prop({})
  image:string
}

export const AvatarPriceSchema = SchemaFactory.createForClass(AvatarPrice);
