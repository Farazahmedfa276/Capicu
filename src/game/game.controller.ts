import { Body, Controller, Get, Post, Param, UseGuards, Query, Put, NotFoundException } from "@nestjs/common";
import { JwtAuthGuard } from "src/json-web-token/jwt-auth-guard";
import { GetUser } from "src/users/get-user.decorator";
import { UserDocument } from "src/users/user.schema";
import { CreateGameDto } from "./dtos/create-game.dto";
import { EndGameDto } from "./dtos/end-game.dto";
import { JoinGameDto } from "./dtos/join-game.dto";
import { GameService } from "./game.service";
import { AuthController } from '../auth/auth.controller'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NakamaGuard } from './game-authgaurd'

@Controller('game')
export class GameController{
    
    constructor(private gameService:GameService){}
    @Post('create-game')
    @ApiBearerAuth('accessToken')
    @UseGuards(NakamaGuard)
    async createGame(
        // @GetUser() user:UserDocument,
        @Body() body:CreateGameDto
    ){
        
            return await this.gameService.createGame(body);
    }


    @Post('end-game')
    @ApiBearerAuth('accessToken')
    @UseGuards(NakamaGuard)
    // @UseGuards(JwtAuthGuard)
    async endGame(
        // @GetUser() user:UserDocument,
        @Body() body:EndGameDto
    ){
        return await this.gameService.endGame(body)
    }

    @Get('user-game/:game_id')
    @UseGuards(JwtAuthGuard)
    async userGame(
        @Param('game_id') id: string
    ){
        return await this.gameService.userGame(id)
    }


    @Get('leaderboard')
     @UseGuards(JwtAuthGuard)
    async leaderBoard(
       @Query() query
    ){
        return await this.gameService.leaderBoard(query)
    }



   @Put('join-game')
    async joinGame(@Body() body:JoinGameDto){
        return await this.gameService.joinGame(body);
    }

    @Get('queue')
    @UseGuards(JwtAuthGuard)
    async queue(@Query() query,@GetUser() user:UserDocument){
        return await this.gameService.checkWaitingQueue(query,user);
    }

    @Get('/')
    @UseGuards(JwtAuthGuard)
    async getGames(
       @Query() query,
       @GetUser() user:UserDocument
    ){
        return await this.gameService.getGames(query,user)
    }

    @Get('graph')
    @UseGuards(JwtAuthGuard)
    async graph(
       @Query() query,
       @GetUser() user:UserDocument
    ){
        return await this.gameService.graph(query,user)
    }

}
