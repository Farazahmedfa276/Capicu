import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
  } from 'class-validator';
  import { InventoryType } from '../constants/inventory-type.enum';
  import { SellingType } from '../constants/selling-type.enum';
  
  export class BuyDto {
  
  
    @IsNotEmpty()
    @IsNumber()
    tokenId: number;
  
    @IsNotEmpty()
    @IsString()
    @IsOptional()
    uri: string;
  
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
  
    @IsNotEmpty()
    @IsString()
    @IsEnum(InventoryType)
    inventoryType: string;
    
    @IsString()
    @IsOptional()
    network:string
  }
  