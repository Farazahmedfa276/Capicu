import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDocument } from 'src/users/user.schema';
import { OfferStatus } from './constants/offer-status.enum';
import { MarketPlaceDocument } from './marketplace.schema';

export type OfferDocument = Offer & Document;


@Schema()
export class Offer {

  @Prop()
  rentType: string;

  @Prop({type:Object})
  marketPlace:MarketPlaceDocument

  @Prop()
  marketPlaceId:string

  @Prop({default:OfferStatus.PENDING,enum:OfferStatus})
  status:string

  @Prop()
  fromUser:string

  @Prop()
  price:number

  @Prop()
  toUser:string

  @Prop()
  quote:number

  @Prop({type:Object})
  user:UserDocument

}

export const OfferSchema = SchemaFactory.createForClass(Offer);
