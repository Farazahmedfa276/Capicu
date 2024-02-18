import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, Length, ValidateNested } from "class-validator";
import { ObjectId } from "mongodb";

export class ClaimNftDto{

    @IsString()
    @IsNotEmpty()
    walletAddress:string

    @IsString()
    @IsNotEmpty()
    network:string

    @IsString()
    @IsNotEmpty()
    gameCenterId:string

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => AssetDto)
    assets: Array<AssetDto>;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => AvatarDto)
    avatars: Array<AvatarDto>;

   

}


class AssetDto{

    @IsString()
    @IsNotEmpty()
    gender:string
    
    @IsString()
    @IsNotEmpty()
    assetType:string
    
}

class AvatarDto{

    @IsString()
    @IsNotEmpty()
    gender:string
    
    @IsString()
    @IsNotEmpty()
    skin:string
    
    @IsBoolean()
    @IsNotEmpty()
    @Transform(({ value }) => false)
    isCompleted:boolean

    @IsNotEmpty()
    @Transform(({ value }) => new ObjectId())
    _id:string


}