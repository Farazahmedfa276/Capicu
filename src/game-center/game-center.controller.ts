import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/json-web-token/jwt-auth-guard';
import { JwtAuthGuardOptional } from 'src/json-web-token/jwt-auth-guard-optional';
import { GetUser } from 'src/users/get-user.decorator';
import { UserDocument } from 'src/users/user.schema';
import { CaptureGameCenterDto } from './dto/capture-game-center.dto';
import { ClaimNftDto } from './dto/claim-nft.dto';
import { UpdateGameCenterGameDto } from './dto/update-game-center-games.dto';
import { UpdateGameCenterDto } from './dto/update-game-center.dto';
import { GameCenterService } from './game-center.service';

@ApiTags('Game Center')
@Controller('game-center')
export class GameCenterController {
  constructor(private gameCenterService: GameCenterService) {}

  @Get('/')
  @UseGuards(JwtAuthGuardOptional)
  async get(@GetUser() user:UserDocument,@Query() query) {
    return await this.gameCenterService.getAll(query,user);
  }

  @Get('/:id')
  async getById(@Param('id') id:string) {
    return await this.gameCenterService.getById({'_id':id});
  }

  @Put('hold-game-center/:id')
  async holdGameCenter(@Param('id') id:string,@Body() body){

    return await this.gameCenterService.holdGameCenter(id,body)

  }

  @Put('capture/:id')
  @UseGuards(JwtAuthGuard)
  async captureGameCenter(@Param('id') id:string,@Body() body:CaptureGameCenterDto,@GetUser() user:UserDocument){

      return this.gameCenterService.captureGameCenter(id,body,user)
  }

  @Put('verify-transaction')
  @UseGuards(JwtAuthGuard)
  async verifyTransaction(@Body() body,@GetUser() user:UserDocument){
      return this.gameCenterService.verifyTransaction(user,body)
  }

  @Get('games/:id')
  async getGameCenterGames(@Param('id') id:string){
    return this.gameCenterService.getGameCenterGames(id)
  }

  @Put('games/:id')
  async updateGameCenterGames(@Param('id') id:string,@Body() body:UpdateGameCenterGameDto){
    return this.gameCenterService.updateGameCenterGames(id,body)
  }

  @Get('stats/:id')
  async gameCenterStats(@Param('id') id:string){
    return this.gameCenterService.gameCenterStats(id);
  }

  @Put('/:id')
  @UseGuards(JwtAuthGuard)
  async updateGameCenter(@Param('id') id:string,@Body() body:UpdateGameCenterDto,@GetUser() user:UserDocument){
      return this.gameCenterService.updateGameCenter(id,body,user);    
  }

  @Post('claim-nfts')
  @UseGuards(JwtAuthGuard)
  async claimNfts(@Body() body:ClaimNftDto,@GetUser() user:UserDocument){
    return this.gameCenterService.claimNft(body,user);    
  }

  @Get('gamerole/:id')
  async ruleById(@Param() id:string){
    return this.gameCenterService.ruleById(id);
  }

}
