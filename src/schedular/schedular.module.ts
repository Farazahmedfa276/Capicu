import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { GameModule } from 'src/game/game.module';
import {
  Tournament,
  TournamentSchema,
} from 'src/tournaments/tournament.schema';
import { TournamentPlayer, TournamentPlayerSchema } from 'src/tournaments/tournament_players.schema';
import { User, UserSchema } from 'src/users/user.schema';
import { SchedularService } from './schedular.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema },
      {name:TournamentPlayer.name,schema:TournamentPlayerSchema},
      {name:User.name,schema:UserSchema}
    ]),
    GameModule,
    ScheduleModule.forRoot(),
  ],
  providers: [SchedularService],
})
export class SchedularModule {}
