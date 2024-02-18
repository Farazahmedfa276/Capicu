import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/json-web-token/jwt-auth-guard';
import { GetUser } from 'src/users/get-user.decorator';
import { UserDocument } from 'src/users/user.schema';
import { NFTCategory } from './constants/nft-category.enum';
import { MintNFTDto } from './dto/mint-nft.dto';
import { NFTUpdateDto } from './dto/nft-update.dto';
import { NftService } from './nft.service';

@ApiTags('NFT')
@Controller('nft')
export class NftController {
  constructor(private nftService: NftService) {}

  @Post('id/:NFTCategory')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async seedNftCategoryTokenId(
    @Param('NFTCategory', new ParseEnumPipe(NFTCategory))
    nftCategory: NFTCategory,
  ) {
    return await this.nftService.seedNftTokenId(nftCategory);
  }

  @Get('id')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getNftTokenId(@Query('NFTCategories') NFTCategories: string) {
    return await this.nftService.getNftTokenId(NFTCategories);
  }

  @Patch('id')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateNftTokenId(@Body() body: NFTUpdateDto) {
    return await this.nftService.updateNftTokenId(body);
  }

  @Post('mint')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async mintNFT(@GetUser() user: UserDocument, @Body() body: MintNFTDto) {
    await this.nftService.mintNFT(user, body);
    return 'NFT Minted Successful';
  }

  @Patch('mint')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateNFTStatus(@Body('hash') hash: string) {
    await this.nftService.updateNFTStatus(hash);
    return 'NFTs status changed successfully';
  }
}
