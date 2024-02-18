import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document } from 'mongoose';
import { DominoTileColor } from './constants/domino-tile-color.enum';
import { TournamentEnvironmentFloor } from './constants/tournament-environment-floor.enum';
import { TournamentRules } from './constants/tournament-rules.enum';
import { TournamentStatus } from './constants/tournament-status.enum';
import { TournamentTableTexture } from './constants/tournament-table-texture.enum';

export type TournamentDocument = Tournament & Document;

interface Players {
  user_id:string,
  entering_date :number,
  name:string
}

@Schema()
export class Tournament {
  @Prop()
  logo: string;

  @Prop({ required: true })
  name: string;

  @Prop({ })
  scheduleDate: Date;

  @Prop({ required: true })
  registrationStartDate: Date;

  @Prop({ required: true })
  registrationEndDate: Date;

  @Prop()
  tournamentStartDate:Date;

  @Prop()
  tournamentEndDate:Date;

  @Prop({ required: true })
  entryFee: number;

  @Prop({ required: true })
  gameCenter: string;

  @Prop({ type: ObjectId })
  host: ObjectId;

  @Prop({ min: 2, max: 64 })
  noOfPlayers: number;

  @Prop({ min: 1, max: 4 })
  noOfStages: number;

  @Prop({ default: 0.3 })
  winnerShare: number;

  @Prop({ default: false })
  isCancelled: boolean;

  @Prop({ default: false })
  isHostedByDominos: boolean;

  @Prop({ default: 0 })
  prizePool: number;

  @Prop()
  winnerId:string

  // @Prop({ default: TournamentRules.RULE_1, enum: TournamentRules })
  // rule: TournamentRules;

  @Prop()
  rule:string
  
  // @Prop()
  // serverSynkDate:string

  @Prop()
  is_participant:boolean;

  @Prop({
    default: TournamentTableTexture.TEXTURE_1,
    enum: TournamentTableTexture,
  })
  tableTexture: TournamentTableTexture;

  @Prop({ default: DominoTileColor.COLOR_1, enum: DominoTileColor })
  dominoTileColor: DominoTileColor;

  @Prop({
    default: TournamentEnvironmentFloor.FLOOR_1,
    enum: TournamentEnvironmentFloor,
  })
  environmentFloor: TournamentEnvironmentFloor;

  @Prop({ default: TournamentStatus.SCHEDULED, enum: TournamentStatus })
  status: TournamentStatus;

  @Prop({ default: [] })
  players: Players[];

  @Prop({default:0})
  totalPlayers:number

  @Prop({default:0})
  playersParticipated:number

  @Prop({default:0})
  minPlayers:number

  @Prop({})
  doc_id:ObjectId

  @Prop({default:new Date()})
  createdAt: Date
}


export const TournamentSchema = SchemaFactory.createForClass(Tournament);
