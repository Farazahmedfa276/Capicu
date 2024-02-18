import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuarterDocument = Quarter & Document;

@Schema()
export class Quarter {


  @Prop()
  index: number;

  @Prop()
  GameModes: Array<{}>;

  @Prop({type: Object})
  pointsTable: { [key: string]: { [key: string]: number } };

  @Prop()
  startDate: Number;

  @Prop()
  endDate: Number

  @Prop({default:new Date()})
  createdAt: Date


}

export const QuarterSchema = SchemaFactory.createForClass(Quarter);

QuarterSchema.index({ index: 1 }, { unique: true });