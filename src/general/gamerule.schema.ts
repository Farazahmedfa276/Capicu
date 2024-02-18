import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameRuleDocument = GameRule & Document;

interface Rules{
    gameRulesName:string,
    noOfPlayers:[],
    coinsToPlay:[]
}


@Schema()
export class GameRule {
  @Prop()
  gameRulesName: string;

  @Prop()
  gameRulesDescription:string;

  @Prop({default:[]})
  noOfPlayers: []; 

  @Prop({default:[]})
  coinsToPlay: []; 
}

export const GameRuleSchema = SchemaFactory.createForClass(GameRule);
