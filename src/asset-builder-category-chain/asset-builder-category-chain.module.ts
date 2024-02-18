import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from 'src/app.service';
import { GeneralModule } from 'src/general/general.module';
import {
  AssetBuilderCategory,
  AssetBuilderCategorySchema,
} from 'src/asset-builder/asset-builder-category.schema';
import { AssetBuilderCategoryChainController } from './asset-builder-category-chain.controller';
import { AssetsChainDataSchema } from './asset-builder-category-chain.schema';
import { AssetBuilderCategoryChainService } from './asset-builder-category-chain.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'assetschaindatas', schema: AssetsChainDataSchema },
      { name: AssetBuilderCategory.name, schema: AssetBuilderCategorySchema },
    ]),
    GeneralModule,
  ],
  providers: [AssetBuilderCategoryChainService, AppService],
  controllers: [AssetBuilderCategoryChainController],
})
export class AssetBuilderCategoryChainModule {}
