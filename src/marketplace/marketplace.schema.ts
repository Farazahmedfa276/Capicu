import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GameCenterDocument } from 'src/game-center/game-center.schema';
import { InventoryType } from './constants/inventory-type.enum';
import { MarketplaceStatus } from './constants/marketplace-status.enum';
import { SellingType } from './constants/selling-type.enum';

export type MarketPlaceDocument = MarketPlace & Document;

type RentData = {
  rentEarning:string,
  rentType:string,
  numberOfDays:string,
  walletAddress:string
}
@Schema()
export class MarketPlace {
  @Prop()
  tokenId: number;

  @Prop()
  uri: string;

  @Prop()
  inventoryClass:string;

  @Prop()
  inventoryName:string

  @Prop()
  price:number;

  @Prop({enum:SellingType,default:SellingType.SELL})
  type:string

  @Prop({enum:InventoryType,default:InventoryType.AVATAR})
  inventoryType:string

  @Prop()
  userId:string

  @Prop()
  userWalletAddress:string

  @Prop()
  network:string

  @Prop()
  isOwner:boolean

  @Prop()
  expiryTime:number

  @Prop()
  rentType:string

  @Prop({type:Object})
  rentData:RentData

  @Prop({default:false})
  isSold:boolean

  @Prop({type:Object})
  gameCenter:GameCenterDocument
  
  @Prop()
  gameCenterId:string

  @Prop()
  hash:string

  @Prop({default:MarketplaceStatus.PENDING})
  status:string

  @Prop()
  toWalletAddress:string

  @Prop()
  gamesPlayed:number;

  @Prop()
  tournamentsPlayed:number

  @Prop()
  ownerName:string

  @Prop()
  tenantName:string
  
  @Prop()
  offerGiven:boolean
}

export const MarketPlaceSchema = SchemaFactory.createForClass(MarketPlace);
