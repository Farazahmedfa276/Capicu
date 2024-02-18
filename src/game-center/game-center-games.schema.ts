import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameCenterGameDocument = GameCenterGame & Document;

interface Rules{
    gameRulesName:string,
    noOfPlayers:[],
    coinsToPlay:[]
}


@Schema()
export class GameCenterGame {
  @Prop()
  Rules: [];

  @Prop()
  coins: Array<{}>;

  @Prop()
  status: boolean;

  @Prop()
  gc_id: string;

}

export const GameCenterGameSchema = SchemaFactory.createForClass(GameCenterGame);
