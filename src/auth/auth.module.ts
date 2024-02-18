import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../users/user.schema';
import { EmailModule } from 'src/email/email.module';
import { JsonWebTokenModule } from 'src/json-web-token/json-web-token.module';
import { GoogleStrategy } from './google.strategy';
import { GoogleOauthGuard } from './google-oauth-guard';
import { GeneralModule } from 'src/general/general.module';
import { GeneralService } from 'src/general/general.service';
import { Promotion, PromotionSchema } from 'src/general/promotion.schema';
import { Coin, CoinSchema } from 'src/general/coin.schema';
import { AuthUtilService } from './auth.utils.service';
import { Contact, ContactSchema } from 'src/general/contact.schema';
import { AssetPrice, AssetPriceSchema } from 'src/asset-builder/asset-price.schema';
import { GameRule, GameRuleSchema } from 'src/general/gamerule.schema';
import { GameCenter, GameCenterSchema } from 'src/game-center/game-center.schema';
import { Setting, SettingSchema } from 'src/general/setting.schema';
import { AvatarPrice, AvatarPriceSchema } from 'src/avatar-builder/avatar-price.schema';

@Module({
  imports: [
    JsonWebTokenModule,
    GeneralModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Coin.name, schema: CoinSchema },
      { name: Promotion.name, schema: PromotionSchema },
      { name: Contact.name, schema: ContactSchema },
      {name:AssetPrice.name,schema:AssetPriceSchema},
      {name:GameRule.name,schema:GameRuleSchema},
      {name:GameCenter.name,schema:GameCenterSchema},
      {name:Setting.name,schema:SettingSchema},
      {name:AvatarPrice.name,schema:AvatarPriceSchema}
    ]),
    EmailModule,
  ],
  providers: [
    AuthService,
    AuthUtilService,
    GoogleStrategy,
    GoogleOauthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthUtilService,AuthService],
})
export class AuthModule {}
