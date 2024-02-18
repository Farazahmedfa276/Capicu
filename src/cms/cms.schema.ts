import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type CmsDocument = Cms & Document;

interface Slug {
    // title:string,
    slug:string,
    // content:string
}

@Schema()
export class Cms{
    @Prop()
    title:string;
    @Prop()
    slug:string;
    @Prop()
    content:string
}

export const CmsSchema = SchemaFactory.createForClass(Cms);
