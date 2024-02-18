import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserDocument } from 'src/users/user.schema';

export type TournamentPlayerDocument = TournamentPlayer & Document;

@Schema()
export class TournamentPlayer {

  @Prop()
  tournament_id: string;

  @Prop()
  user_id:string;

  @Prop({type:Object})
  user: UserDocument;

  @Prop({default:Date.now()})
  registration_date:number

  @Prop({default:1})
  round:number

  @Prop({default:true})
  inTournament:boolean

  @Prop({})
  tournamentEndDate:number

  @Prop()
  gameCenter: string;

}

export const TournamentPlayerSchema = SchemaFactory.createForClass(TournamentPlayer);
