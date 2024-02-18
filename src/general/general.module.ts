import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Coin, CoinSchema } from './coin.schema';
import { Contact, ContactSchema } from './contact.schema';
import { GameRule, GameRuleSchema } from './gamerule.schema';
import { GeneralController } from './general.controller';
import { GeneralService } from './general.service';
import { Promotion, PromotionSchema } from './promotion.schema';
import { Setting, SettingSchema } from './setting.schema';
import { FetchModule } from 'nestjs-fetch';
import {
  AssetPercentage,
  AssetPercentageSchema,
} from './asset-percentages.schema';
import { Season, SeasonSchema } from './season.schema';
import { User, UserSchema } from 'src/users/user.schema';
import {
  AssetPrice,
  AssetPriceSchema,
} from 'src/asset-builder/asset-price.schema';
import { CoinExchange, CoinExchangeSchema } from './coinexhanges.schema';
import { AvatarBuilderModule } from 'src/avatar-builder/avatar-builder.module';
import { AssetBuilderModule } from 'src/asset-builder/asset-builder.module';
import {
  AvatarBuilderCategory,
  AvatarBuilderCategorySchema,
} from 'src/avatar-builder/avatar-builder-category.schema';
import {
  MarketPlace,
  MarketPlaceSchema,
} from 'src/marketplace/marketplace.schema';
import {Quarter, QuarterSchema } from "src/game/quarter.schema"


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Promotion.name, schema: PromotionSchema },
      { name: Coin.name, schema: CoinSchema },
      { name: Contact.name, schema: ContactSchema },
      { name: GameRule.name, schema: GameRuleSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: AssetPercentage.name, schema: AssetPercentageSchema },
      { name: Season.name, schema: SeasonSchema },
      { name: User.name, schema: UserSchema },
      { name: AssetPrice.name, schema: AssetPriceSchema },
      { name: CoinExchange.name, schema: CoinExchangeSchema },
      { name: AvatarBuilderCategory.name, schema: AvatarBuilderCategorySchema },
      { name: MarketPlace.name, schema: MarketPlaceSchema },
      { name: Quarter.name, schema: QuarterSchema },

    ]),
    FetchModule,
    AssetBuilderModule,
  ],
  controllers: [GeneralController],
  providers: [GeneralService],
  exports: [GeneralService],
})
export class GeneralModule {}
