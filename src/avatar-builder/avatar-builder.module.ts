import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AvatarBuilderCategory,
  AvatarBuilderCategorySchema,
} from './avatar-builder-category.schema';
import { AvatarBuilderService } from './avatar-builder.service';
import { AvatarBuilderController } from './avatar-builder.controller';
import { AvatarPrice, AvatarPriceSchema } from './avatar-price.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AvatarBuilderCategory.name, schema: AvatarBuilderCategorySchema },
      { name: AvatarPrice.name, schema: AvatarPriceSchema },
    ]),
  ],
  providers: [AvatarBuilderService],
  controllers: [AvatarBuilderController],
  exports: [AvatarBuilderService],
})
export class AvatarBuilderModule {}
