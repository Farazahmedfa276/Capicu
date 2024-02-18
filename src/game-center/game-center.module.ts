import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameRule, GameRuleSchema } from 'src/general/gamerule.schema';
import { GeneralModule } from 'src/general/general.module';
import { Setting, SettingSchema } from 'src/general/setting.schema';
import {
  Transaction,
  TransactionSchema,
} from 'src/general/transactions.schema';
import { MarketPlace, MarketPlaceSchema } from 'src/marketplace/marketplace.schema';
import { TournamentsModule } from 'src/tournaments/tournaments.module';
import { TournamentsService } from 'src/tournaments/tournaments.service';
import { UsersModule } from 'src/users/users.module';
import {
  GameCenterGame,
  GameCenterGameSchema,
} from './game-center-games.schema';
import { GameCenterNft, GameCenterNftSchema } from './game-center-nfts.schema';
import { GameCenterController } from './game-center.controller';
import { GameCenter, GameCenterSchema } from './game-center.schema';
import { GameCenterService } from './game-center.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GameCenter.name, schema: GameCenterSchema },
      { name: GameRule.name, schema: GameRuleSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: GameCenterGame.name, schema: GameCenterGameSchema },
      {name:Setting.name,schema:SettingSchema},
      {name:MarketPlace.name,schema:MarketPlaceSchema},
      {name:GameCenterNft.name,schema:GameCenterNftSchema}
    ]),
    GeneralModule,
    UsersModule,
    forwardRef(() => TournamentsModule),
  ],

  controllers: [GameCenterController],
  providers: [GameCenterService],
  exports: [GameCenterService],
})
export class GameCenterModule {}
