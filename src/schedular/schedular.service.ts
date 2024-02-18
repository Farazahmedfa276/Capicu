import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { GameStatus } from 'src/game/constants/game-status.enum';
import { GameService } from 'src/game/game.service';
import { TournamentStatus } from 'src/tournaments/constants/tournament-status.enum';
import {
  Tournament,
  TournamentDocument,
} from 'src/tournaments/tournament.schema';
import { TournamentPlayer, TournamentPlayerDocument } from 'src/tournaments/tournament_players.schema';
import { User, UserDocument } from 'src/users/user.schema';

@Injectable()
export class SchedularService {
  constructor(
    @InjectModel(Tournament.name)
    private tournamentModel: Model<TournamentDocument>,
    @InjectModel(TournamentPlayer.name)
    private tournamentPlayersModel:Model<TournamentPlayerDocument>,
    @InjectModel(User.name)
    private userModel:Model<UserDocument>,
    private gameService:GameService
  ) {}

  @Cron('2 * * * * *')
  async setTournamentsFromScheduledToOpen() {

    // console.log("tournament cron");
    try{
      let current_date = new Date();
      let tournaments = await this.tournamentModel.find({tournamentStartDate:{$lt:current_date},status:{$ne:TournamentStatus.PAST}})
      // console.log('tournaments-->',tournaments);
      tournaments.forEach(async tournament=>{
        // console.log("single-->",tournament)
        if(tournament.playersParticipated < (tournament.totalPlayers/2)){
          tournament.status= TournamentStatus.PAST;
          await tournament.save();
          await this.refundDomicoins(tournament)
        }
      })
        
      // console.log("end tournament cron");

    }
    catch(e){
        console.log('e-->',e);
    }

  }

  @Cron('2 * * * * *')
  async updateGame(){
    
    let games = await this.gameService.getTournamentGamesWithSingleUsers();
    
    games.forEach(async game=>{
        // console.log('games-->',game);
        let tournaments = await this.tournamentModel.findOne({_id: game.tournamentId, status:{$ne:TournamentStatus.PAST}})
        console.log('tournaments<-->',tournaments);
        if(tournaments){
        game.status = GameStatus.STARTED;
        await game.save();
        this.gameService.endGame({matchId:game.id,winnerId:game.userIds[0].id})
        }
    })

  }

  async refundDomicoins(tournament){

    let tournamentPlayers = await this.tournamentPlayersModel.find({"tournament_id":tournament._id});

    tournamentPlayers.forEach(async player=>{
      // console.log('suer-->',player.user_id);
      await this.userModel.updateOne({"_id":player.user_id},{$inc:{domicoins:tournament.entryFee}})
    })

  }
}
