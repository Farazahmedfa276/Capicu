import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema()
export class Setting {
    
    @Prop()
    game_center_price:number

    @Prop()
    free_nft:number

}

export const SettingSchema = SchemaFactory.createForClass(Setting);
