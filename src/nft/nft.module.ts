import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssetPrice, AssetPriceSchema } from 'src/asset-builder/asset-price.schema';
import { AvatarPrice, AvatarPriceSchema } from 'src/avatar-builder/avatar-price.schema';
import { MintedNFT, MintedNFTSchema } from './minted-nft.schema';
import { NFTTokenId, NFTTokenIdSchema } from './nft-token-id.schema';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NFTTokenId.name, schema: NFTTokenIdSchema },
      { name: MintedNFT.name, schema: MintedNFTSchema },
      {name:AssetPrice.name,schema:AssetPriceSchema},
      {name:AvatarPrice.name,schema:AvatarPriceSchema}
    ]),
  ],
  controllers: [NftController],
  providers: [NftService],
})
export class NftModule {}
