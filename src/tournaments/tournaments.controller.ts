import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/json-web-token/jwt-auth-guard';
import { GetUser } from 'src/users/get-user.decorator';
import { UserDocument } from 'src/users/user.schema';
import { CreateTournamentDto } from './dtos/create-tournament.dto';
import { GetTournamentsQueryDto } from './dtos/get-tournaments-query.dto';
import { UpdateTournamentDto } from './dtos/update-tournament.dto';
import { TournamentsService } from './tournaments.service';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private tournamentService: TournamentsService) {}

  @Post('/')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async createTournament(
    @GetUser() userDoc: UserDocument,
    @Body() body: CreateTournamentDto,
  ) {
    return await this.tournamentService.createTournament(userDoc, body);
  }

  @Get('/')
  async getTournament(@Query() query: GetTournamentsQueryDto) {
    return await this.tournamentService.getTournaments(query);
  }

  @Get('/bracket/:tournament_id')
  async getTournamentBracket(@Param('tournament_id') id: string) {
    return await this.tournamentService.getTournamentBracket(id);
  }

  @Post('/enter/:tournament_id')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async enterTournament(
    @GetUser() userDoc: UserDocument,
    @Param('tournament_id') id: string,
  ) {
    return await this.tournamentService.enterTournament({
      tournament_id: id,
      user: userDoc,
    });
  }

  @Post('/exit/:tournament_id')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async exitTournament(
    @GetUser() userDoc: UserDocument,
    @Param('tournament_id') id: string,
  ) {
    return await this.tournamentService.exitTournament({
      tournament_id: id,
      user: userDoc,
    });
  }

  @Get('/:id')
  async getTournamentById(@Query() query,@Param('id') id: string) {
    return await this.tournamentService.getTournamentById(id,query);
  }

  @Get('/tournament_match/:tournament_id')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async tournamentMatch(
    @GetUser() userDoc: UserDocument,
    @Param('tournament_id') id: string,
  ) {
    return await this.tournamentService.tournamentMatch({
      tournament_id: id,
      user: userDoc,
    });
  }

  @Patch('/:id')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateTournament(
    @GetUser() userDoc: UserDocument,
    @Param('id') id: string,
    @Body() body:UpdateTournamentDto
  ){
    return await this.tournamentService.updateTournament(userDoc, body,id);

  }

  @Get('/tournament-winner/:id')
  // @ApiBearerAuth('accessToken')
  async getTournamentWinner(@Param('id') id:string){

    return this.tournamentService.getTournamentWinner(id)

  }

  @Delete('/:id')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async deleteTournament(@Param('id') id:string){
    return this.tournamentService.deleteTournament(id)
  }

  @Post('/cancelTournamnet/:id')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async cancelTournament(@Param('id') id:string){
    return this.tournamentService.cancelTournament(id)
  }
}
