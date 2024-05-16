import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateGameDto{

    @IsNotEmpty()
    @IsArray()
    userIds:[]

    @IsOptional()
    @IsString()
    matchId:string

    
    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    coins:number

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    gameRule:string

    
}