import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MintedInventoryDto } from 'src/users/user.schema';

export type GameDocument = Game & Document;


interface User{
  id:string,
  name:string
}
@Schema()
export class Game {
  
  @Prop()
  userIds: User[];

  @Prop()
  coins:number;

  @Prop()
  gameRule:string;

  
  @Prop()
  winnerId:string;

  @Prop({default:new Date()})
  createdAt:Date

  
  
}

type CharacterObject = {
  mintedInventory:Array<MintedInventoryDto>,
  mintedGender:string,
  mintedCharacter:MintedInventoryDto
}

export const GameSchema = SchemaFactory.createForClass(Game);

// Apply index on createdAt field
GameSchema.index({ createdAt: 1 });