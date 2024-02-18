import { IsNotEmpty, IsString } from "class-validator";

export class CaptureGameCenterDto{

    @IsString()
    @IsNotEmpty()
    hash:string

    @IsString()
    @IsNotEmpty()
    network:string

}