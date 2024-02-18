import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionStatus } from './constants/transaction-status.enum';

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
    
    @Prop()
    fromAddress:string

    @Prop()
    toAddress:string

    @Prop()
    hash:string

    @Prop()
    network:string


    @Prop()
    userId:string
    
    @Prop({default:TransactionStatus.PENDING,enum:TransactionStatus})
    status:string

    @Prop()
    gameCenterId:string

    @Prop()
    expiry:number
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
