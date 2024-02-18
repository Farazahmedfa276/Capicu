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
  
  export class MyInventoryDto {
  
    @IsString()
    tokenIds: string;

    @IsOptional()
    @IsString()
    network:string;

}