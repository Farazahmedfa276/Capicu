import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/user.schema';
import { CreateTournamentDto } from './dtos/create-tournament.dto';
import { GetTournamentsQueryDto } from './dtos/get-tournaments-query.dto';
import { Tournament, TournamentDocument } from './tournament.schema';
import { TournamentPlayer, TournamentPlayerDocument } from './tournament_players.schema';
import { TournamentStatus } from './constants/tournament-status.enum';
import { GameService } from 'src/game/game.service';
import { UsersService } from 'src/users/users.service';
import { GameCenter, GameCenterDocument } from 'src/game-center/game-center.schema';
import { GeneralService } from 'src/general/general.service';
import { async } from 'rxjs';
var moment = require('moment');
@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name)
    private tournamentModel: Model<TournamentDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(TournamentPlayer.name)
    private tournamentPlayerModel: Model<TournamentPlayerDocument>,
    private gameService:GameService,
    private userService:UsersService,
    @InjectModel(GameCenter.name)
    private gameCenterModel:Model<GameCenterDocument>,
    private generalService:GeneralService
    ) { }

  async createTournament(host: UserDocument, payload: CreateTournamentDto) {
    const { logo: logoBase64 } = payload;

    // const logoImageExtension = logoBase64.split(';')[0].split('/')[1];

    // const logo = nanoid();

    const tournament = new this.tournamentModel({
      host: host._id,
      ...payload,
    });
    console.log('registrationStartDate time-->',tournament.registrationStartDate)

     this.addTournamentEndDate(tournament)
     
     tournament.totalPlayers = Math.pow(tournament.noOfPlayers, tournament.noOfStages);
     tournament.doc_id = new ObjectId(tournament.id);
     await tournament.save();

     this.generateTournamentGames(tournament.id);


    return { data:tournament, message: 'Tournament Created Successfuly' };
  }

  async deleteTournament(id){

    let current_date = new Date();

    let tournament = await this.tournamentModel.findOne({'_id':id,'registrationStartDate':{'$gt':current_date}})

    if(!tournament){

      throw new NotFoundException("Tournament Not Found");

    }

    tournament.delete();

    return {message:"Tournament deleted successfully"}

  }

  async cancelTournament(id){

    let current_date = new Date();

    let tournament = await this.tournamentModel.findOne({'_id': id,'tournamentStartDate':{'$gt':current_date}})

    if(!tournament){

      throw new NotFoundException("Tournament Not Found");

    }

    if(tournament?.isCancelled){
      throw new NotFoundException("Tournament already cancelled");
    }

    tournament.status= TournamentStatus.PAST;
    tournament.isCancelled = true;
    await tournament.save();
    
    let tournamentPlayers = await this.tournamentPlayerModel.find({"tournament_id":tournament._id});

    tournamentPlayers.forEach( async player => {

    await this.userModel.updateOne({"_id":player.user_id},{$inc:{domicoins:tournament.entryFee}})
    
    })

    return {message:"Tournament cancel successfully"}

  }

  addTournamentEndDate(tournament){

    let tournamentEndDate = new Date(tournament.tournamentStartDate);

    tournamentEndDate.setDate(tournamentEndDate.getDate() + (tournament.noOfStages) );

    tournament.tournamentEndDate = tournamentEndDate;

    return tournament;

  }

  async updateTournament(user,body,id){

    let tournament = await this.tournamentModel.findOne({'_id':id});
    let currentDate = new Date().getTime();
    if(!tournament){

      throw new NotFoundException("Tournament Not Found");

    }
    console.log('body.tournamentStartDate.getTime()-->',body.tournamentStartDate.getTime());
    console.log('tournament.tournamentStartDate.getTime()-->',tournament.tournamentStartDate.getTime());
    // if(body.tournamentStartDate.getTime() != tournament.tournamentStartDate.getTime()){
    //   tournament.tournamentStartDate = body.tournamentStartDate;
    //   this.gameService.updateMatchDate(tournament);
    // }
    if(body.registrationEndDate.getTime() >= tournament.registrationEndDate.getTime()){
      console.log("registeration is on")
      if(body.tournamentStartDate.getTime() != tournament.tournamentStartDate.getTime()){
        tournament.tournamentStartDate = body.tournamentStartDate;
        this.gameService.updateMatchDate(tournament);
      }
    }

    if(currentDate > tournament.registrationEndDate.getTime()){
      console.log("registration is closed",currentDate , tournament.registrationEndDate.getTime())
      throw new BadRequestException('registration is closed')
    }

    this.addTournamentEndDate(tournament)

    await this.tournamentModel.updateOne({'_id':id},{$set:body})

    tournament = await this.tournamentModel.findOne({'_id':id});

    return this.appendData(tournament,{});

  }

  async getTournamentById(id,query){

      let tournament = await this.tournamentModel.findOne({'_id':id});

      if(!tournament){

        throw new NotFoundException("Tournament Not Found");

      }
      
      return this.appendData(tournament,query);

  }

  async tournamentMatch(params){

    let tournament = await this.tournamentModel.findOne({'_id':params.tournament_id})

    if(!tournament){

      throw new NotFoundException('tournament not found');

    }

    let match = await this.gameService.tournamentMatch(params,tournament)

    if(tournament.playersParticipated < (tournament.totalPlayers/2)){
      
      return  { warning : 'Due to insufficient number of players, this tournamnet has been cancelled, you will get a refund'};
    }

    return match;
  
  }

  async getTournamentBracket(id:string){

    let tournament = await this.tournamentModel.findOne({ '_id': id });

    if (!tournament) {

      throw new BadRequestException('Invalid tournament');

    }

    return await this.createBrackets(tournament);


  }

  async createBrackets(tournament) {

      let data = [];

      for (let i = 1; i <= tournament.noOfStages; i++) {

        let stage = {};

        let games = await this.gameService.getgamesByTournament(tournament.id,i);
        
        stage['title'] = `Round ${i}`;

        stage['seeds'] = await this.getSeeds(games,tournament,i);

        data.push(stage);

    }

    return data;

  }

  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    console.log(result);
    return result;
  }

  async getSeeds(games,tournament,round_number) {


    let seeds_array = [];

      //No Of Matches in Round
      let game_date = this.addDays(tournament.tournamentStartDate,round_number-1);
      let game_time = this.addDays(tournament.tournamentStartDate,round_number-1);
      console.log(game_time);
      for(let i=0;i<games.length; i++){
        let usersIds = games[i].userIds.map(async (element) => {
        let users = await this.userModel.findOne({_id: element.id},{userName:1})  
        return users;
        });
        let userData = await Promise.all(usersIds);
        let seed =  {
            id: i,
            date: game_date,
            teams: userData
        }

        if(games[i].userIds.length < tournament.noOfPlayers){
            for(let j=games[i].userIds.length;j<tournament.noOfPlayers;j++){
              seed.teams.push({userName:"TBD"})
            }
        }

     
        seeds_array.push(seed);

    }

    return seeds_array;

  }

 
  async getTournaments(query: GetTournamentsQueryDto) {
    
    
    const { page, limit, searchString, host, isHostedByDominos, status,myTournament,game_center_id,selectedRule} =
    query;
    let status_query = this.getStatusQuery(status);
    console.log(status_query);

      let mongo_query = [
        { isHostedByDominos: !!isHostedByDominos },
        host ? { host: new ObjectId(host) } : {},
          status ? status_query : {},
          myTournament && myTournament!='false'?{'_id':{'$in':await this.getUserTournaments(query.user_id)}}:{},
          game_center_id?{'gameCenter':game_center_id}:{},

          selectedRule && selectedRule!=''?{rule:selectedRule}:{},
            searchString
              ? { $or: [{ name: { $regex: searchString, $options: 'i' } }] }
              : {}
      ];

     
    let tournamets = await this.tournamentModel
      .find({
        $and: mongo_query
      })
      .skip((page - 1) * 10)
      .limit(limit);

      let data = await this.isUserInTournament(tournamets, query);
      let total_count  = await this.tournamentModel
      .count({
        $and: mongo_query
      })
      return {data,total_count};


  }

  getStatusQuery(status){
    let current_date = new Date()
    let mongo_query;
    switch(status){
      case 'open':
        mongo_query = {registrationStartDate:{$lte:current_date},registrationEndDate:{$gte:current_date },status:{$ne:TournamentStatus.PAST }}
        break;
      case 'pending':
        mongo_query = {registrationEndDate:{$lt:current_date},tournamentStartDate:{$gt:current_date},status:{$ne:TournamentStatus.PAST}}
        break;  
      case 'live':
        mongo_query = {tournamentStartDate:{$lte:current_date},tournamentEndDate:{$gt: current_date},status:{$ne:TournamentStatus.PAST}}
        break;
      case 'past':
        mongo_query = {status:TournamentStatus.PAST}
        break;
    }

    return mongo_query;

  }

  async getUserTournaments(userId){

    let user_torunaments = await this.tournamentPlayerModel.find({'user_id':userId},{tournament_id:1})

    let tournament_ids = user_torunaments.map(function(user_torunament) {
      return user_torunament['tournament_id'];
    });

    return tournament_ids;

  }

  getTournamentsPlayedByNft(tokenId){

    return this.tournamentPlayerModel.count({'user.character.mintedCharacter.tokenId':tokenId});

  }

  async isUserInTournament(tournaments, query) {

    if(tournaments.length){

    let tournament_player = tournaments.map(async (tournament) => {

      tournament = this.appendData(tournament,query);

      return tournament;

    })

      tournaments = await Promise.all(tournament_player);
    
    }

    return tournaments;

  }

  async appendData(tournament,query){

    this.changeStatus(tournament)

    if (query.user_id) {

      let player = await this.tournamentPlayerModel.findOne({ 'tournament_id': tournament.id, 'user_id': query.user_id });

      tournament.is_participant = player ? true : false;

    }

    let game_center = await this.gameCenterModel.findOne({'_id':tournament.gameCenter});

    tournament.gameCenter = game_center?game_center.gameCenterName:'';
    //tournament.serverSynkDate =  new Date(tournament?.tournamentStartDate).toString().split('GMT')[0] 


    return tournament;

  }


  async getOngoingTournaments(game_center_id=null){

    let current_date = new Date();

    let query = {
      registrationStartDate:{$lte:current_date},
      tournamentEndDate:{$gt:current_date},
      status:{$ne:TournamentStatus.PAST},
      gameCenter:game_center_id
    };

    return this.tournamentModel.count(query);

  }

  async prizePool(game_center_id){

    let gameCenterTournaments = await this.getTournamentsByGameCenter(game_center_id)

    let tournaments = await this.tournamentModel.find({'_id':{$in:gameCenterTournaments}})

    let prizePool = 0;
    
    tournaments.forEach(tournament=>{

      prizePool += tournament.prizePool 

    })

    return prizePool;
 
  }

  async earningPercentage(game_center_id){

    return 75;

  }
  

  async getPastTournaments(game_center_id=null){

    return await this.tournamentModel.count({'gameCenter':game_center_id,'status':TournamentStatus.PAST})

  }

  async getTotalTournaments(game_center_id = null){

    return await this.tournamentModel.count({'gameCenter':game_center_id})

  }

  async getTournamentsByGameCenter(game_center_id){

    let tournaments = await this.tournamentModel.find({'gameCenter':game_center_id})

    let tournament_arr = tournaments.map(tournament=>{

        return tournament.id;
    })

    let data = await Promise.all(tournament_arr);

    return data;


  }
  
  async changeStatus(tournament){
    let current_date = new Date();
    console.log("get status", tournament.status)
    if(tournament.registrationStartDate < current_date &&  tournament.registrationEndDate  > current_date && tournament.status !== TournamentStatus.PAST){
      tournament.status = TournamentStatus.OPEN
    }
    else if(tournament.registrationEndDate < current_date &&  tournament.tournamentStartDate  > current_date && tournament.status !== TournamentStatus.PAST){
      tournament.status = TournamentStatus.PENDING
    }
    else if(tournament.registrationEndDate < current_date &&  tournament.tournamentEndDate  > current_date && tournament.status !== TournamentStatus.PAST){
      tournament.status = TournamentStatus.LIVE
    }
    else{
      tournament.status = TournamentStatus.PAST
    }
    // console.log("getstatus",tournament.status);

    // let current_date = new Date();

    // if(tournament.registrationStartDate < current_date &&  tournament.registrationEndDate  > current_date){

    //   tournament.status = TournamentStatus.OPEN

    // }

    // else if(tournament.registrationEndDate < current_date &&  tournament.tournamentEndDate  > current_date){

    //   tournament.status = TournamentStatus.LIVE

    // }

    // else{

    //   tournament.status = TournamentStatus.PAST

    // }


  }
  
  async enterTournament(data) {
    
    console.log(data.user.id);

    let tournament = await this.tournamentModel.findOne({ _id: data.tournament_id, registrationStartDate: { "$lte": new Date() }, registrationEndDate: { "$gte": new Date() } });

    
    
    if (!tournament) {
      
      throw new BadRequestException("Invalid Tournament");
      
    }
    
    let tournament_players = await this.tournamentPlayerModel.count({ tournament_id: tournament.id })
    let no_of_players = Math.pow(tournament.noOfPlayers, tournament.noOfStages);

    let is_user_tournament = await this.tournamentPlayerModel.findOne({ tournament_id: tournament.id, user_id: data.user.id })

    if (is_user_tournament) { 

      throw new BadRequestException("You have already registered in this tournament");

    }

    if(!data.user.character || !data.user.character.mintedCharacter){

      throw new BadRequestException("Please select default avatar to enter in tournament");

    }

    if (no_of_players <= tournament_players) {

      throw new BadRequestException("Tournament Already Full");

    }

    if (tournament.entryFee > data.user.domicoins) {

      throw new BadRequestException("You don't have enough domicoins");

    }
    console.log(' tournament.tournamentStartDate-->', tournament.tournamentStartDate.getTime());
    let inTournamentCheck = await this.tournamentPlayerModel.findOne({user_id: data.user.id, inTournament: true, tournamentEndDate:{$gt: tournament.tournamentStartDate.getTime()}})
    console.log(inTournamentCheck);
    
    // if(inTournamentCheck){
    //   throw new BadRequestException("You are already registered in another tournament");
    // }
    
    await this.gameService.getAvailableTournamentGame(tournament,data.user)

    data.user.domicoins = data.user.domicoins - tournament.entryFee;

    await data.user.save();
    
    data.user_id = data.user.id;

    data.inTournament = true;

    data.tournamentEndDate = tournament.tournamentEndDate.getTime();

    await this.tournamentPlayerModel.create(data)

    
    await this.tournamentModel.updateOne(
      { _id: data.tournament_id }, // Specify the query to find the document
      { $inc: { playersParticipated: 1 } } // Use $inc to increment the field
    );

    const message = "User Registered in tournament Successfully";

    return { message };

  }

  async exitTournament(data) {
    
    let tournament = await this.tournamentModel.findOne({ _id: data.tournament_id, registrationStartDate: { "$lte": new Date() }, registrationEndDate: { "$gte": new Date() } });

    if (!tournament) {
      throw new BadRequestException("Invalid Tournament");
    }
    
    
    let is_user_tournament = await this.tournamentPlayerModel.findOne({ tournament_id: tournament.id, user_id: data.user.id })

    if (!is_user_tournament) { 

      throw new BadRequestException("You have not registered in this tournament");

    }

    
    await this.gameService.exitTournamentGame(tournament,data.user)

    data.user.domicoins = data.user.domicoins + tournament.entryFee;

    await data.user.save();
    
    await this.tournamentPlayerModel.deleteOne({ tournament_id: tournament.id, user_id: data.user.id })

    tournament.playersParticipated -= 1;
    
    await tournament.save();

    const message = "User Exit tournament Successfully";

    return { message };

  }

  async generateTournamentGames(tournament_id){

    let tournament = await this.tournamentModel.findOne({'_id':tournament_id})

    let games_in_tournament = await this.gameService.getgamesByTournament(tournament.id)

    if(games_in_tournament!.length){

      return;
    
    }

    await this.gameService.createTournamentGame(tournament)

  }


  async getTournamentWinner(id){

    let tournament = await this.tournamentModel.findOne({'_id':id});

    if(!tournament){

      throw new NotFoundException("Tournament Not Found");

    }

    
    let last_game = await this.gameService.getTournamentsLastGame(id);

    const winningPrize = tournament?.winnerShare || last_game.userShare;


    let winner = await this.userService.getUserById(last_game.winnerId);

    let runnerUpIds = last_game.userIds.filter(user=>user.id != last_game.winnerId);

    let data  = runnerUpIds.map(async user=>{
          return await this.userService.getUserById(user.id);
    })

    let runnerUps = await Promise.all(data);

    return {winner,runnerUps,winningPrize};

  }
}
