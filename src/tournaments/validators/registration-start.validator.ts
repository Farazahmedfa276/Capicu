import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { CreateTournamentDto } from "../dtos/create-tournament.dto";

@ValidatorConstraint({ name: 'tournamentStartDate', async: true })
@Injectable()
export class StartDateValidation implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
        let createTournamentDto : CreateTournamentDto = args.object as CreateTournamentDto;
        
        return (createTournamentDto.registrationStartDate < createTournamentDto.registrationEndDate && createTournamentDto.registrationStartDate < createTournamentDto.tournamentStartDate)
  }
  defaultMessage(args: ValidationArguments) {
    return `Registration Start Date must be less than Registration End Date and Registration Start Date must be less than Tournament Start Date`; 
  }
}