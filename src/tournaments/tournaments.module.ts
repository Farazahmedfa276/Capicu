import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameCenterModule } from 'src/game-center/game-center.module';
import {
  GameCenter,
  GameCenterSchema,
} from 'src/game-center/game-center.schema';
import { GameCenterService } from 'src/game-center/game-center.service';
import { GameModule } from 'src/game/game.module';
import { Game, GameSchema } from 'src/game/game.schema';
import { GameService } from 'src/game/game.service';
import { GeneralModule } from 'src/general/general.module';
import { User, UserSchema } from 'src/users/user.schema';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { Tournament, TournamentSchema } from './tournament.schema';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import {
  TournamentPlayer,
  TournamentPlayerSchema,
} from './tournament_players.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema },
      { name: User.name, schema: UserSchema },
      { name: TournamentPlayer.name, schema: TournamentPlayerSchema },
      { name: Game.name, schema: GameSchema },
      {name:GameCenter.name,schema:GameCenterSchema}
    ]),
    UsersModule,
    GameModule,
    GeneralModule
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}
