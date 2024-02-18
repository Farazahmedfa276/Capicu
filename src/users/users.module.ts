import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { AvatarBuilderModule } from 'src/avatar-builder/avatar-builder.module';
import { AssetBuilderModule } from 'src/asset-builder/asset-builder.module';
import { AppService } from 'src/app.service';
import { GeneralModule } from 'src/general/general.module';
import { AuthUtilService } from 'src/auth/auth.utils.service';
import { AuthModule } from 'src/auth/auth.module';
import { AssetPrice, AssetPriceSchema } from 'src/asset-builder/asset-price.schema';
import { Transaction, TransactionSchema } from 'src/general/transactions.schema';
import { GameCenterModule } from 'src/game-center/game-center.module';
import { GameCenter, GameCenterSchema } from 'src/game-center/game-center.schema';
import { GameModule } from 'src/game/game.module';
import { Game, GameSchema } from 'src/game/game.schema';
import { Tournament, TournamentSchema } from 'src/tournaments/tournament.schema';
import { Quarter,QuarterSchema } from 'src/game/quarter.schema'; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
      {name:AssetPrice.name,schema:AssetPriceSchema},
      {name:Transaction.name,schema:TransactionSchema},
      {name:GameCenter.name,schema:GameCenterSchema},
      {name:Game.name,schema:GameSchema},
      {name:Tournament.name, schema:TournamentSchema},
      {name:Quarter.name, schema: QuarterSchema },
    ]),
    AvatarBuilderModule,
    AssetBuilderModule,
    GeneralModule,
    AuthModule,
  ],
  providers: [UsersService, AppService,AuthUtilService],
  controllers: [UsersController],
  exports:[UsersService]
})
export class UsersModule {}
