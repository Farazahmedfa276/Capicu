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
  
  export class OnSaleListingDto {
  
    @IsOptional()
    @IsEnum(SellingType)
    type: string;

    @IsOptional()
    @IsEnum(InventoryType)
    inventoryType:string

    @IsOptional()
    myInventory:string

    @IsOptional()
    @IsString()
    inventoryClass:string

    @IsOptional()
    @IsString()
    search:string

    @IsOptional()
    limit:string

    @IsOptional()
    page:string

    @IsOptional()
    minPrice:string

    @IsOptional()
    maxPrice:string

    @IsOptional()
    isSearch:string

    @IsOptional()
    network:string

    
}