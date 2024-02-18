import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CoinDocument = Coin & Document;

@Schema()
export class Coin {
  @Prop()
  wei: number;

  @Prop()
  domicoin: number;

  @Prop()
  usdt:number;
}

export const CoinSchema = SchemaFactory.createForClass(Coin);
