import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { CoinExchangeType } from './constants/coin-exchange-type.enum';

export type CoinExchangeDocument = CoinExchange & Document;

@Schema()
export class CoinExchange {
  @Prop()
  name: string;

  @Prop()
  walletAddress: string;

  @Prop()
  network: string;

  @Prop()
  userId:ObjectId;
  // userID:string

  @Prop()
  coin:number;

  @Prop({default:false})
  status:boolean;

  @Prop({default:CoinExchangeType.EXCHANGE})
  type:string

  @Prop({default:new Date()})
  exchangeDate:Date

  @Prop()
  usdt:number
}

export const CoinExchangeSchema = SchemaFactory.createForClass(CoinExchange);
