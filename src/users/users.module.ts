import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';

import { AppService } from 'src/app.service';
import { AuthUtilService } from 'src/auth/auth.utils.service';
import { AuthModule } from 'src/auth/auth.module';
import { GameModule } from 'src/game/game.module';
import { Game, GameSchema } from 'src/game/game.schema';
import { Quarter,QuarterSchema } from 'src/game/quarter.schema'; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
      {name:Game.name,schema:GameSchema},
      {name:Quarter.name, schema: QuarterSchema },
    ]),
    
    AuthModule,
  ],
  providers: [UsersService, AppService,AuthUtilService],
  controllers: [UsersController],
  exports:[UsersService]
})
export class UsersModule {}
