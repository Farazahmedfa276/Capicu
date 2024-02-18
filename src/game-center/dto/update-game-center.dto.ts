import { IsNotEmpty, IsString } from "class-validator";

export class UpdateGameCenterDto{

    @IsString()
    @IsNotEmpty()
    gameCenterName:string

    @IsString()
    @IsNotEmpty()
    gameCenterDescription:string

}