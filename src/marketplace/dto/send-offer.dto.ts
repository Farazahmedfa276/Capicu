import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString
  } from 'class-validator';
  
  export class SendOfferDto {
  
    @IsNumber()
    @IsNotEmpty()
    quote: number;

    @IsOptional()
    @IsString()
    network: string

}