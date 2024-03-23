import { IsNotEmpty, IsString } from "class-validator";

export class JoinGameDto{

    @IsNotEmpty()
    @IsString()
    matchId:string

    @IsNotEmpty()
    @IsString()
    userId:string

}