import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NFTCategory } from './constants/nft-category.enum';

export type NFTTokenIdDocument = NFTTokenId & Document;

@Schema()
export class NFTTokenId {
  @Prop({ enum: NFTCategory })
  NFTCategory: NFTCategory;

  @Prop()
  mostSignificantDigit: number;

  @Prop()
  currentId: number;
}

export const NFTTokenIdSchema = SchemaFactory.createForClass(NFTTokenId);

NFTTokenIdSchema.index(
  { NFTCategory: 1 },
  { unique: true, partialFilterExpression: { NFTCategory: { $exists: true } } },
);

NFTTokenIdSchema.index(
  { mostSignificantDigit: 1 },
  {
    unique: true,
    partialFilterExpression: { mostSignificantDigit: { $exists: true } },
  },
);
