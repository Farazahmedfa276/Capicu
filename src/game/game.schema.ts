import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MintedInventoryDto } from 'src/users/user.schema';
import { GameStatus } from './constants/game-status.enum';
import { GameType } from './constants/game-type.enum';

export type GameDocument = Game & Document;


interface User{
  id:string,
  name:string
}

interface UserJoined{
  id:string,
  joinExpiration:number
}

@Schema()
export class Game {
  
  @Prop()
  userIds: User[];

  @Prop()
  nakamaGameId:string;

  @Prop()
  noOfPlayers:number;

  @Prop()
  coins:number;

  @Prop()
  gameRule:string;

  @Prop({default:GameStatus.OPEN,enum:GameStatus})
  status:GameStatus

  @Prop({default:GameType.MULTIPLAYER,enum:GameType})
  gameType:GameType

  @Prop()
  winnerId:string;

  @Prop({default:"0:00"})
  duration:string

  @Prop({default:0})
  startTime:number

  @Prop({})
  userShare:number

  @Prop({})
  gameCenterShare:number

  @Prop()
  tournamentId:string

  @Prop()
  matchNumber:number

  @Prop()
  round:number

  @Prop()
  nextMatchNumber:number

  @Prop()
  matchDate:number

  @Prop({})
  timeDifference:number

  @Prop({type:Object})
  character:CharacterObject

  @Prop()
  gameCenter:string;

  @Prop()
  tournamnetStatus:boolean;

  @Prop()
  serverTime:number

  @Prop()
  usersJoined: UserJoined[]

  @Prop({default:new Date()})
  createdAt:Date

  @Prop()
  gamePoints: Array<{}>

  @Prop()
  basePoints:number
  
}

type CharacterObject = {
  mintedInventory:Array<MintedInventoryDto>,
  mintedGender:string,
  mintedCharacter:MintedInventoryDto
}

export const GameSchema = SchemaFactory.createForClass(Game);

// Apply index on createdAt field
GameSchema.index({ createdAt: 1 });