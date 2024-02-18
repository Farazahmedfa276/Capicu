import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import { InventoryType } from '../constants/inventory-type.enum';
import { RentType } from '../constants/rent-type.enum';
import { SellingType } from '../constants/selling-type.enum';
import { GameCenterValidation } from '../validators/game-center-id.validator';

export type Rent = {
   rentType:RentType,
   numberOfDays:number
}

export class SellDto {


  @IsNotEmpty()
  @IsNumber()
  tokenId: number;

  @IsNotEmpty()
  @IsString()
  uri: string;

  @IsNotEmpty()
  @IsString()
  inventoryName:string
  

  @IsNotEmpty()
  @IsString()
  inventoryClass:string

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  price: number;

  @IsNotEmpty()
  @IsString()
  @IsEnum(SellingType)
  type: string;

  @IsString()
  @IsOptional()
  userId:string

  @IsString()
  @IsOptional()
  userWalletAddress:string

  @IsNotEmpty()
  @IsString()
  @IsEnum(InventoryType)
  @Validate(GameCenterValidation)
  inventoryType: string;

  @IsOptional()
  @IsObject()
  rentData:Rent

  @IsOptional()
  @IsString()
  gameCenterId:string

  @IsNotEmpty()
  @IsString()
  hash:string

  @IsOptional()
  @IsString()
  rentType:string

  @IsOptional()
  @IsString()
  network:string


  
}
