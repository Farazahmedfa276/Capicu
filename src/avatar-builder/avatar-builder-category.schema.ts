import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from '../global/constants/gender.enum';
import { IAvatarBuilderCategoryData } from './avatar-builder-category-data.interface';

export type AvatarBuilderCategoryDocument = AvatarBuilderCategory & Document;

@Schema()
export class AvatarBuilderCategory {
  @Prop()
  name: string;

  @Prop()
  shortCode: string;

  @Prop({ enum: Gender })
  gender: Gender;

  @Prop({ type: Object })
  data: IAvatarBuilderCategoryData;
}

export const AvatarBuilderCategorySchema = SchemaFactory.createForClass(
  AvatarBuilderCategory,
);
