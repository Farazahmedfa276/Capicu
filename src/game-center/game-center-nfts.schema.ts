import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDocument } from 'src/users/user.schema';
import { Assets } from './constants/asset-claim.interface';
import { GameCenterNftStatus } from './constants/game-center-nfts-status.enum';

export type GameCenterNftDocument = GameCenterNft & Document;

export type Avatars = {
    gender:string;
    skin:string;
    isCompleted:boolean;
    _id:string
}


@Schema()
export class GameCenterNft{
  @Prop()
  gameCenterId: string;

  @Prop({default:GameCenterNftStatus.PENDING})
  status:string

  @Prop()
  gameCenterName:string

  @Prop()
  walletAddress:string

  @Prop()
  network:string

  @Prop()
  avatars:Avatars[]

  @Prop()
  assets:Assets[]

  @Prop({type:Object})
  user:UserDocument

  @Prop({default:6})
  avatarTotal:number

  @Prop({default:4})
  assetTotal:number

}

export const GameCenterNftSchema = SchemaFactory.createForClass(GameCenterNft);
