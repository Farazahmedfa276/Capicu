import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDocument } from 'src/users/user.schema';

export type GameCenterDocument = GameCenter & Document;

interface Rules{
    gameRulesName:string,
    noOfPlayers:[],
    coinsToPlay:[]
}


@Schema()
export class GameCenter {
  @Prop()
  gameCenterID: string;

  @Prop()
  gameCenterName: string;

  @Prop()
  gameCenterDescription: string;

  @Prop()
  gameCenterImageURL: string;

  @Prop({default:false})
  transactionStatus:boolean

  @Prop({default:0})
  transactionTime:number

  @Prop({default:[]})
  RuleDetails: Rules[]; 

  @Prop({})
  ownerId:string

  @Prop({default : 0})
  price:number

  @Prop({type:{}})
  stats:Object

  @Prop({default:true})
  status:boolean

  @Prop({default:false})
  placeOnMarketPlace:boolean

  @Prop({type:Object})
  owner:UserDocument

  @Prop({default:false})
  freeNFTs:boolean

  @Prop({})
  nftPending:number;

  @Prop()
  gameCenterGames:[]


}

export const GameCenterSchema = SchemaFactory.createForClass(GameCenter);
