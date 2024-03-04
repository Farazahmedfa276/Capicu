import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
          {name:User.name,schema:UserSchema},
          {name:Quarter.name, schema: QuarterSchema },
        ]),
        UsersModule,
        
        // MarketPlaceModule
    ],
    controllers:[GameController],
    providers:[GameService],
    exports:[GameService]
})
export class GameModule {}
