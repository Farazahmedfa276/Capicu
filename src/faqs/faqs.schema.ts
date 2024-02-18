import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type FaqDocument = Faq & Document;

interface Ans {
    answer:string,
}

@Schema()
export class Faq{
    @Prop()
    question:string;
    @Prop()
    answer:string;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
