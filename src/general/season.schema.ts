import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SeasonDocument = Season & Document;

type SeasonObject = {
    slug: any;
    name:string,
    from:Date,
    to:Date
}



@Schema()
export class Season {
  @Prop()
  type: string;

  @Prop({type:Array})
  season: SeasonObject[];

  @Prop({type:Object})
  selectedSeason:SeasonObject

}

export const SeasonSchema = SchemaFactory.createForClass(Season);
