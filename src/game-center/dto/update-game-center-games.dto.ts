import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateGameCenterGameDto{

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    status:boolean


    @IsArray()
    @IsOptional()
    coins

}