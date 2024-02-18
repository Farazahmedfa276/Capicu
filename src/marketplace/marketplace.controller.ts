import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/json-web-token/jwt-auth-guard';
import { GetUser } from 'src/users/get-user.decorator';
import { UserDocument } from 'src/users/user.schema';
import { MyInventoryDto } from './dto/my-inventory.dto';
import { OnSaleListingDto } from './dto/on-sale-listing.dto';
import { SellDto } from './dto/sell.dto';
import { SendOfferDto } from './dto/send-offer.dto';
import { MarketPlaceService } from './marketplace.service';


@ApiTags('market-place')
@Controller('market-place')
export class MarketPlaceController {
  constructor(private marketPlaceService: MarketPlaceService) {}

  @Post('sell') /** network*/
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async sell(@GetUser() user:UserDocument,@Body() body:SellDto){
    return await this.marketPlaceService.sell(body,user)
  }

  @Get('my-inventory') /** network*/
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async myInventory(@GetUser() user:UserDocument,@Query() query:MyInventoryDto){
    return this.marketPlaceService.myInventory(query,user);
  }

  @Get('my-inventory-with-rented') /** network*/
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async myInventoryWithRentedCards(@GetUser() user:UserDocument,@Query() query:MyInventoryDto){
    return this.marketPlaceService.myInventoryWithRentedCards(query,user);
  }

  @Put('replace-url')
  async replaceurl(@Body("url") url: string){
    return await this.marketPlaceService.replaceurl(url);
  }


  @Get('sale') /** network*/
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async sale(@Query() query:OnSaleListingDto,@GetUser() user:UserDocument){
    return this.marketPlaceService.getInventoryOnSale(user,query)
  }

  @Get('rented-inventories') /** network*/
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async rentedInventories(@Query() query:OnSaleListingDto,@GetUser() user:UserDocument){
    return this.marketPlaceService.rentedInventories(user,query)
  }

  @Get('my-rented-inventories') /** network*/
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async myRentedInventories(@Query() query:OnSaleListingDto,@GetUser() user:UserDocument){
    return this.marketPlaceService.myRentedInventories(user,query)
  }

  @Post('buy/:id') /** network*/
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async buy(@GetUser() user:UserDocument,@Param('id') id:string){
    return await this.marketPlaceService.buy(id,user)
  }

  @Delete('/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async removeFromMarket(@GetUser() user:UserDocument,@Param('id') id:string){
    return await this.marketPlaceService.removeFromMarket(id,user)
  }

  @Put('verify-transaction')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async verifyTransaction(@GetUser() user:UserDocument,@Body() body){
    return await this.marketPlaceService.verifyTransaction(body)
  }

  @Get('walletUsers')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async walletUsers(@GetUser() user:UserDocument){
    return await this.marketPlaceService.walletUsers(user);
  }

  @Post(':id/offer') /** network*/
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async offer(@GetUser() user:UserDocument,@Body() body:SendOfferDto,@Param('id') id:string){
    return await this.marketPlaceService.sendOffer(user,id,body)
  }

  @Get('exclusive-offers')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async exclusiveOffers(@GetUser() user:UserDocument,@Query() query){
    return await this.marketPlaceService.exclusiveOffers(user,query)
  }

  @Put('reject-offer/:offer_id')
  async rejectOffer(@Param('offer_id') offer_id:string){
    return await this.marketPlaceService.rejectOffer(offer_id)
  }
  
  @Get(':id/offers')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async offersOnInventory(@Query() query:OnSaleListingDto,@Param('id') id:string){
    return this.marketPlaceService.offersOnInventory(id,query)
  }

  @Post('accept-user-offer/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async acceptUserOffer(@Param('id') id:string,@GetUser() user:UserDocument){
    return this.marketPlaceService.offer(id,user)
  }

  @Get('nftStats/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async nftStats(@Param('id') id:string ){
    
    return this.marketPlaceService.nftStats(id)

  }

  @Get('nftDetails/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async nftDetail(@Param('id') id:string,@GetUser() user:UserDocument ){
    
    return this.marketPlaceService.nftDetail(id,user)

  }

  

  @Delete('recover/:id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async recoverInventory(@Param('id') id:string){
    return this.marketPlaceService.recoverInventory(id)
  }
  
  


}
