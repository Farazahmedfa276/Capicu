import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { InventoryType } from "../constants/inventory-type.enum";
import { SellDto } from "../dto/sell.dto";

@ValidatorConstraint({ name: 'tournamentStartDate', async: true })
@Injectable()
export class GameCenterValidation implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
        let sellDto : SellDto = args.object as SellDto;
        if(sellDto.inventoryType == InventoryType.GAMECENTER){
            return sellDto.gameCenterId !=null && sellDto.gameCenterId != ''
        }
        return true;
  }
  defaultMessage(args: ValidationArguments) {
    return `Game Center is required`; 
  }
}