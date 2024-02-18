import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AssetBuilderCategory,
  AssetBuilderCategorySchema,
} from './asset-builder-category.schema';
import { AssetBuilderService } from './asset-builder.service';
import { AssetBuilderController } from './asset-builder.controller';
import { AssetPrice, AssetPriceSchema } from './asset-price.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AssetBuilderCategory.name, schema: AssetBuilderCategorySchema },
      {name:AssetPrice.name,schema:AssetPriceSchema}
    ]),
  ],
  providers: [AssetBuilderService],
  controllers: [AssetBuilderController],
  exports: [AssetBuilderService],
})
export class AssetBuilderModule {}
