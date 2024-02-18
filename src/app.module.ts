import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { JsonWebTokenModule } from './json-web-token/json-web-token.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { SchedularModule } from './schedular/schedular.module';
import { AvatarBuilderModule } from './avatar-builder/avatar-builder.module';
import { AssetBuilderModule } from './asset-builder/asset-builder.module';
import { UploadModule } from './upload/upload.module';
import { AssetBuilderCategoryChainModule } from './asset-builder-category-chain/asset-builder-category-chain.module';
import { GeneralModule } from './general/general.module';
import { GameModule } from './game/game.module';
import { NftModule } from './nft/nft.module';
import { GameCenterModule } from './game-center/game-center.module';
import { MarketPlaceModule } from './marketplace/marketplace.module';
import { CmsModule } from './cms/cms.module';
import { FaqsModule } from './faqs/faqs.module';

const path = require('path');

const cert_path = `${path.join(
  __dirname,
  '..',
  'src',
  'certs',
)}/rds-combined-ca-bundle.pem`;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    CacheModule.register({ isGlobal: true }),

    MongooseModule.forRootAsync({
      useFactory: (
        configService: ConfigService,
      ): MongooseModuleFactoryOptions => {
        
        return {
          uri: "mongodb://Capicu:%20%25e!3(2XD9q_%3F%5E*%2B@capicu-2024-02-16-20-03-13.cluster-cniczwgmkeja.us-east-2.docdb.amazonaws.com:27017/?authMechanism=DEFAULT",
          sslCA: cert_path,
          retryWrites: false,
          ssl: true,
        };
      },
      inject: [ConfigService],
    }),

    JsonWebTokenModule,
    EmailModule,
    AuthModule,
    UsersModule,
    TournamentsModule,
    SchedularModule,
    AvatarBuilderModule,
    AssetBuilderModule,
    UploadModule,
    AssetBuilderCategoryChainModule,
    GeneralModule,
    GameModule,
    NftModule,
    GameCenterModule,
    GameModule,
    MarketPlaceModule,
    CmsModule,
    FaqsModule
  ],

  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
