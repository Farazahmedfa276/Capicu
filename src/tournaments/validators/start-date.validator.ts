import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { CreateTournamentDto } from "../dtos/create-tournament.dto";

@ValidatorConstraint({ name: 'tournamentStartDate', async: true })
@Injectable()
export class CustomDateValidation implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
        let createTournamentDto : CreateTournamentDto = args.object as CreateTournamentDto;
        
        return createTournamentDto.tournamentStartDate > createTournamentDto.registrationEndDate
  }
  defaultMessage(args: ValidationArguments) {
    return `Tournament Start Date must be greater than Registration End Date`;
  }
}