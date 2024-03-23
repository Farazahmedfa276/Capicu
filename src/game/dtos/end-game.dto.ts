import { IsNotEmpty, IsString, IsArray } from "class-validator";

export class EndGameDto{

    @IsNotEmpty()
    @IsString()
    matchId:string

    @IsNotEmpty()
    @IsString()
    winnerId:string


    @IsNotEmpty()
    @IsArray()
    players:[]
}