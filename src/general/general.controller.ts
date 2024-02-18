import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/json-web-token/jwt-auth-guard';
import { GetUser } from 'src/users/get-user.decorator';
import { UserDocument } from 'src/users/user.schema';
import { CoinExchangeDto } from './dto/coin-exchange-create.dto';
import { ContactUsDto } from './dto/contact-us.dto';
import { NewsLetterDto } from './dto/news-letter.dto';
import { GeneralService } from './general.service';

@ApiTags('General')
@Controller('general')
export class GeneralController {
  constructor(private generalService: GeneralService) {}

  @Get('launch-date')
  async getLaunchDate(@Query() query) {
    return await this.generalService.getLaunchDate(query);
  }

  @Get('check-white-list-date')
  @UseGuards(JwtAuthGuard)
  async checkWhiteListDate(@GetUser() user:UserDocument,@Query() query) {
    return await this.generalService.checkWhiteListDate(user, query);
  }

  @Get('coin-rate')
  async getCoinRate() {
    return await this.generalService.getCoinRate();
  }

  @Post('contact-us')
  async contactUs(@Body() body: ContactUsDto) {
    return await this.generalService.contactUs(body);
  }

  @Post('news-letter')
  async newsLetter(@Body() body: NewsLetterDto) {
    const message = 'Success';

    return await this.generalService.newsLetter(body);
  }

  @Put('verify-transaction')
  async verifyTransaction(@Body() body){

    return await this.generalService.verifyTransaction(body);

  }

  @Get('game-rules')
  async getGameRules(){

    return await this.generalService.getGameRules()

  }

  @Get('read-file')
  async readFile(){

    return await this.generalService.readFile('asdad')

  }

  @Get('season')
  async season(){

    return await this.generalService.season();

  }

  @Get('coin-exchange-listing')
  @UseGuards(JwtAuthGuard)
  async getCoinExchangeListing(@GetUser() user:UserDocument,@Query() query){

    return await this.generalService.getCoinExchangeListing(user,query)

  }

  @Post('coin-exchange')
  @UseGuards(JwtAuthGuard)
  async storeCoinExchange(@GetUser() user:UserDocument,@Body() body:CoinExchangeDto){

    return await this.generalService.storeCoinExchange(body,user);

  }

  @Get('category-skin')
  async getCategorySkinListing(){
    return await this.generalService.getCategorySkinListing()
  }
}
