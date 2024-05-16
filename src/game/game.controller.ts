import { Body, Controller, Get, Post, Param, UseGuards, Query, Put, NotFoundException } from "@nestjs/common";
import { CreateGameDto } from "./dtos/create-game.dto";
import { EndGameDto } from "./dtos/end-game.dto";
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GameService } from "./game.service";



@ApiTags('Game')
@Controller('game')
export class GameController{
    
    constructor(private gameService:GameService){}
    @Post('create-game')
    @ApiBearerAuth('accessToken')
    async createGame(
        // @GetUser() user:UserDocument,
        @Body() body:CreateGameDto
    ){
        
            return await this.gameService.createGame(body);
    }


    @Post('end-game')
    @ApiBearerAuth('accessToken')
    async endGame(
        // @GetUser() user:UserDocument,
        @Body() body:EndGameDto
    ){
        return await this.gameService.endGame(body)
    }

    

}