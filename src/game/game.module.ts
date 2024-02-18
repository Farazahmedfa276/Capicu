import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameCenter, GameCenterSchema } from 'src/game-center/game-center.schema';
import { GeneralModule } from 'src/general/general.module';
import { MarketPlaceModule } from 'src/marketplace/marketplace.module';
import { MarketPlace, MarketPlaceSchema } from 'src/marketplace/marketplace.schema';
import { Tournament, TournamentSchema } from 'src/tournaments/tournament.schema';
import { TournamentPlayer, TournamentPlayerSchema } from 'src/tournaments/tournament_players.schema';
import { User, UserSchema } from 'src/users/user.schema';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { GameController } from './game.controller';
import { Game, GameSchema } from './game.schema';
import { GameService } from './game.service';
import {Quarter, QuarterSchema } from "./quarter.schema"

@Module({
    imports: [
        MongooseModule.forFeature([
          { name: Game.name, schema: GameSchema },
          {name:TournamentPlayer.name,schema:TournamentPlayerSchema},
          {name:Tournament.name,schema:TournamentSchema},
          {name:GameCenter.name,schema:GameCenterSchema},
          {name:User.name,schema:UserSchema},
          {name:MarketPlace.name,schema:MarketPlaceSchema},
          {name:Quarter.name, schema: QuarterSchema },
        ]),
        UsersModule,
        GeneralModule,
        // MarketPlaceModule
    ],
    controllers:[GameController],
    providers:[GameService],
    exports:[GameService]
})
export class GameModule {}
