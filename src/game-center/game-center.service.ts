import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TransactionStatus } from "src/general/constants/transaction-status.enum";
import { GameRule, GameRuleDocument } from "src/general/gamerule.schema";
import { GeneralService } from "src/general/general.service";
import { Setting, SettingDocument } from "src/general/setting.schema";
import { Transaction, TransactionDocument } from "src/general/transactions.schema";
import { MarketPlace, MarketPlaceDocument } from "src/marketplace/marketplace.schema";
import { TournamentsService } from "src/tournaments/tournaments.service";
import { UsersService } from "src/users/users.service";
import { GameCenterGame, GameCenterGameDocument } from "./game-center-games.schema";
import { GameCenterNft, GameCenterNftDocument } from "./game-center-nfts.schema";
import { GameCenter, GameCenterDocument } from "./game-center.schema";
import { GameCenterNftStatus } from "./constants/game-center-nfts-status.enum";

@Injectable()
export class GameCenterService{

    constructor(
        @InjectModel(GameCenter.name)
        private gameCenterModel: Model<GameCenterDocument>,
        @InjectModel(GameRule.name)
        private gameRuleModel: Model<GameRuleDocument>,
        private generalService:GeneralService,
        @InjectModel(Transaction.name)
        private transactionModel:Model <TransactionDocument>,
        @InjectModel(GameCenterGame.name)
        private gameCenterGameModel:Model<GameCenterGameDocument>,
        @InjectModel(Setting.name)
        private settingModel:Model<SettingDocument>,
        @InjectModel(MarketPlace.name)
        private marketPlaceModel:Model<MarketPlaceDocument>,
        @InjectModel(GameCenterNft.name)
        private gameCenterNftModel:Model<GameCenterNftDocument>,
        private userService:UsersService,
        private tournamentService:TournamentsService
      ) {}

    async getAll(query,user){

        return this.getListing(query,user);

    }

    async getGameCenterGames(id){

        return this.gameCenterGameModel.find({'gc_id':id});

    }

    async updateGameCenterGames(id,body){

      let gameCenterGame = await this.gameCenterGameModel.findOne({'_id':id})

      if(!gameCenterGame){

        throw new NotFoundException("GameCenter Game Not Found")

      }

      await this.gameCenterGameModel.updateOne({'_id':gameCenterGame.id},{$set:body})

      gameCenterGame = await this.gameCenterGameModel.findOne({'_id':id})

      return gameCenterGame;

    }

    async captureGameCenter(id,body,user){


      let game_center = await this.gameCenterModel.findOne({'_id':id,placeOnMarketPlace:true})

      if(!game_center){

        throw new NotFoundException("Game Center Not Found")

      }

      // let game_center_transaction = await this.transactionModel.findOne({'gameCenterId':id,'status':{'$ne':TransactionStatus.CANCELLED}})

      // if((game_center_transaction && game_center_transaction.userId !== user.id)){

      //   throw new BadRequestException("Game Center Is on hold")

      // }

      let timeObject = new Date(); 

      timeObject = new Date(timeObject.getTime() + 1000 * 10);
      
      let transaction_obj = {
        'hash':body.hash,
        'network':body.network,
        'gameCenterId':id,
        'fromAddress':user.metaMaskWalletAddress,
        'userId':user.id,
        'expiry':timeObject.getTime()
      }

      return await this.transactionModel.create(transaction_obj);

    }

    async claimNft(body,user){

      console.log('body-->',body);
      let gameCenter = await this.gameCenterModel.findOne({"_id":body.gameCenterId,freeNFTs:true});

      if(!gameCenter){ 

        throw new NotFoundException("Game Center Don't have free nfts");

      }

      let gameCenterNft = await this.gameCenterNftModel.findOne({gameCenterId:gameCenter.id,'status':'pending'})
      
      if(gameCenterNft){

        throw new BadRequestException("Game Center Don't have free nfts");

      }

      gameCenter.freeNFTs = false;
      await gameCenter.save();

      body.user = user;
      body.gameCenterName = gameCenter.gameCenterName;

      await this.gameCenterNftModel.create(body);

      return {message:"Free Nfts Claimed Successfully"}

    }

    async verifyTransaction(user,body){

      let game_center_transaction = await this.transactionModel.findOne({'status':TransactionStatus.PENDING,'hash':body.hash,userId:user.id})

      if(!game_center_transaction){

        throw new NotFoundException("Invalid Game Center Transaction")

      }

      let userGameCenter = await this.gameCenterModel.findOne({'_id':game_center_transaction.gameCenterId,'placeOnMarketPlace':true})

      let transaction_status = await this.generalService.verifyTransaction(game_center_transaction,'game_center',userGameCenter)

      if(!transaction_status){

        game_center_transaction.status = TransactionStatus.CANCELLED;
        await game_center_transaction.save();
        throw new BadRequestException("Transaction Cancelled");
      
      }

      game_center_transaction.status = TransactionStatus.COMPLETED;
      await game_center_transaction.save();

      let game_center = await this.gameCenterModel.findOne({'_id':game_center_transaction.gameCenterId})
      let admin_user = await this.userService.getAdminUser();
      if(game_center.ownerId==admin_user.id){
        game_center.freeNFTs = true;
      }
      game_center.ownerId = user.id;
      game_center.placeOnMarketPlace = false;
      await game_center.save();

      await this.marketPlaceModel.updateOne({gameCenterId:game_center.id,isSold:false},{$set:{isSold:true}});


      return game_center;
    
    }

    async gameCenterNfts(body){



    }


    async updateGameCenter(id,body,user){

      const {gameCenterName,gameCenterDescription} = body

      let gameCenter = await this.gameCenterModel.findOne({'_id':id,ownerId:user.id})

      // console.log('gameCenter->',gameCenter)
      if(!gameCenter){

        throw new NotFoundException("Game Center Not Found")

      }

      gameCenter.gameCenterName = gameCenterName
      gameCenter.gameCenterDescription = gameCenterDescription

      await gameCenter.save();

      return gameCenter;


    }



    async getById(query){

      let game_center = await this.gameCenterModel.findOne(query);


      if(!game_center){

        throw new NotFoundException('Game Center Not Found')

      }

      let price = await this.settingModel.findOne();

      game_center = await this.getGameCenterRules(game_center);

      game_center.stats = await this.gameCenterStats(game_center.id);

      game_center.price = price?price.game_center_price: 0

      game_center.owner = await this.userService.getUserById(game_center.ownerId)

      game_center.nftPending = await this.gameCenterNftModel.count({gameCenterId:game_center.id,status:GameCenterNftStatus.PENDING})

      return game_center;

    }

    async holdGameCenter(game_center_id,body){

        let gameCenter = await this.gameCenterModel.findOne({'_id':game_center_id,placeOnMarketPlace:true});

        if(!gameCenter){

            throw new NotFoundException('Game Center Not Found');

        }

        let current_date = new Date().getTime();

        if(gameCenter.transactionStatus && !body.release && current_date < gameCenter.transactionTime){

          throw new BadRequestException('Game Center Transaction in progress')

        }

        let add_minutes = new Date().getTime() + (5*60000);

        gameCenter.transactionTime = add_minutes;

        gameCenter.transactionStatus = body.release?false:true;

        await gameCenter.save();

        return gameCenter;

    }

    async getListing(query,user) {

        const current_page = query.page?query.page:1;

        const limit = query.limit?query.limit:50;
    
        const offset = limit * current_page - limit;

        const adminUser = await this.userService.getAdminUser();

        let mongo_query = {
          // 'ownerId':adminUser.id,
          'status':true
        };
        
        if(query.myGameCenter && query.myGameCenter=="true"){
           mongo_query['ownerId'] = user.id
        }
        
        if (query.search) {
          mongo_query['gameCenterName'] = { $regex: query.search };
        }

        if(query.no_sell && query.no_sell=="true"){
            mongo_query['placeOnMarketPlace'] = false;
        }
    
        let total_count = await this.gameCenterModel.count();
    
        let game_centers = await this.gameCenterModel
          .find(mongo_query)
          .skip(offset)
          .limit(limit).sort({_id:-1});
        
        let price = await this.settingModel.findOne();

        let game_centers_arr = game_centers.map(async(game_center)=>{

          game_center.price = price?price.game_center_price : 0;
          
          game_center = await this.getGameCenterRules(game_center);

          game_center.nftPending = await this.gameCenterNftModel.count({gameCenterId:game_center.id,status:GameCenterNftStatus.PENDING})
          //  if(mongo_query['status'] == true){
          //   return game_center;
          //  }
          // console.log(game_center,'STATUS Game Center')
          // console.log(query,'Query Game Center')
          // console.log(user,'User Game Center')

          //  if(query.status == true){
          //   return game_center;
          //  }
          // console.log(game_center)
          return game_center;
        
        })

        let data = await Promise.all(game_centers_arr);
    
        return { data, total_count, current_page, limit };
      }


    async getGameCenterRules(game_center){
      
      // console.log("ASDasd");
        game_center.gameCenterGames =await this.getEnableGameCenterGames(game_center.id);

        // if(game_center.RuleDetails.length){

        //   return game_center

        // }

        let rules = await this.gameRuleModel.find();

        game_center.RuleDetails = rules;
        
        return game_center;

    }

    async getEnableGameCenterGames(id){
      
      let data = await this.gameCenterGameModel.aggregate([
          { $match: {gc_id: id,status:true}},
          { $unwind: '$coins'},
          { $unwind: '$Rules'},
          { $match: {'coins.default': true}},
          { $group: {_id: '$_id',Rules : { $addToSet: '$Rules' }, coins: {$push: '$coins.price'}}},
          
      ])

      data.forEach(d=>{
        d.Rules[0].coins = d.coins.sort()
        console.log(d.coins,'COIN SORT')
        delete d.coins;
      })
      return data;
      // return this.gameCenterGameModel.find({'gc_id':id});

    }

    async gameCenterStats(id){

      let game_center = await this.gameCenterModel.findOne({'_id':id})

      if(!game_center){

        throw new NotFoundException("No Game Center Found")

      }

      const ongoingTournaments = await this.tournamentService.getOngoingTournaments(id)

      const pastTournaments = await this.tournamentService.getPastTournaments(id)

      const createdTournaments = await this.tournamentService.getTotalTournaments(id)
      
      const prizePool = await this.tournamentService.prizePool(id)

      const earningPercentage = await this.tournamentService.earningPercentage(id)

      return {ongoingTournaments,pastTournaments,createdTournaments,prizePool,earningPercentage}

    }

    async ruleById(id){
      // console.log()
      let game_role = await this.gameRuleModel.findOne({_id:id.id});
      if(!game_role){
        throw new NotFoundException(`game role with id: ${id} was not found`)
      }else {
      return await game_role;
      }
    }
}