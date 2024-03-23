import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateGameDto{

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    playerId:string

    @IsNotEmpty()
    @IsArray()
    @IsOptional()
    userIds:[]

    @IsOptional()
    @IsString()
    matchId:string

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    tournamentId:string

    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    noOfPlayers:number

    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    coins:number

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    gameRule:string

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    gameCenter:string

}