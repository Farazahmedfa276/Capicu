import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameCenterModule } from 'src/game-center/game-center.module';
import { GameModule } from 'src/game/game.module';
import { GeneralModule } from 'src/general/general.module';
import { TournamentsModule } from 'src/tournaments/tournaments.module';
import { User, UserSchema } from 'src/users/user.schema';
import { UsersModule } from 'src/users/users.module';
import { MarketPlaceController } from './marketplace.controller';
import { MarketPlace, MarketPlaceSchema } from './marketplace.schema';
import { MarketPlaceService } from './marketplace.service';
import { Offer, OfferSchema } from './offers.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketPlace.name, schema: MarketPlaceSchema },
      {name:Offer.name,schema:OfferSchema},
      {name:User.name,schema:UserSchema}
    ]),
    GameCenterModule,
    GeneralModule,
    UsersModule,
    GameModule,
    TournamentsModule
  ],
  controllers: [MarketPlaceController],
  providers: [MarketPlaceService],
  exports:[MarketPlaceService]
})
export class MarketPlaceModule {}
