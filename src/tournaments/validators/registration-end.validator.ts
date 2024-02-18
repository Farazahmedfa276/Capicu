import { Injectable } from "@nestjs/common";
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { CreateTournamentDto } from "../dtos/create-tournament.dto";

@ValidatorConstraint({ name: 'tournamentStartDate', async: true })
@Injectable()
export class EndDateValidation implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
        let createTournamentDto : CreateTournamentDto = args.object as CreateTournamentDto;
        
        return (createTournamentDto.registrationStartDate < createTournamentDto.registrationEndDate && createTournamentDto.registrationEndDate < createTournamentDto.tournamentStartDate)
  }
  defaultMessage(args: ValidationArguments) {
    return `Registration End Date must be greater than Registration Start Date and Registration End Date must be less than Tournament Start Date`; 
  }
}