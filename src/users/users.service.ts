import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssetBuilderService } from 'src/asset-builder/asset-builder.service';
import { AssetPrice, AssetPriceDocument } from 'src/asset-builder/asset-price.schema';
import { AuthService } from 'src/auth/auth.service';
import { AuthUtilService } from 'src/auth/auth.utils.service';
import { AvatarBuilderService } from 'src/avatar-builder/avatar-builder.service';
import { GameCenter, GameCenterDocument } from 'src/game-center/game-center.schema';
import { Game, GameDocument } from 'src/game/game.schema';
import { GameService } from 'src/game/game.service';
import { CoinExchangeType } from 'src/general/constants/coin-exchange-type.enum';
import { TransactionStatus } from 'src/general/constants/transaction-status.enum';
import { GeneralService } from 'src/general/general.service';
import { Transaction, TransactionDocument } from 'src/general/transactions.schema';
import { Tournament, TournamentDocument } from 'src/tournaments/tournament.schema';
import { Gender } from '../global/constants/gender.enum';
import { SetAssetCategoriesDto } from './dtos/set-asset-categories.dto';
import { SetAvatarCategoriesDto } from './dtos/set-avatar-categories.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { User, UserDocument } from './user.schema';
import { GameType } from '../game/constants/game-type.enum'
import { GameStatus } from 'src/game/constants/game-status.enum';
import { throwError } from 'rxjs';
// import { Quarter, QuarterDocument } from ""
import { Quarter , QuarterDocument } from 'src/game/quarter.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AssetPrice.name) private assetPriceModel: Model<AssetPriceDocument>,
    private avatarBuilderService: AvatarBuilderService,
    private assetBuilderService: AssetBuilderService,
    private generalService: GeneralService,
    private authUtilService:AuthUtilService,
    @InjectModel(Transaction.name)
    private transactionModel:Model<TransactionDocument>,
    @InjectModel(GameCenter.name)
    private gameCenterModel:Model<GameCenterDocument>,
    private authService:AuthService,
    @InjectModel(Game.name)
    private gameModel:Model<GameDocument>,
    @InjectModel(Tournament.name)
    private tournamentModel:Model<TournamentDocument>,
    @InjectModel(Quarter.name)
    private quarterModal: Model<QuarterDocument>
    
    ) {}

  async updateUser(userDoc: UserDocument, dto) {

    if(dto.metaMaskWalletAddress){

      await this.checkUserWithWalletAddress(userDoc,dto);

    }
    if(dto?.userName){
        let username = await this.userModel.findOne({userName: dto.userName, _id: {"$ne":userDoc._id}})
        if(username){
          throw new BadRequestException("UserName Already exists");
        }
    }

    let user = await this.userModel.findOneAndUpdate(
      { _id: userDoc._id },
      { $set: dto },
      { new: true },
    );

    return await this.authService.serializeUser(user,user.accessToken);
  
  }

  async getAvatarDetails(character){

    const {mintedCharacter} = character;

    let avatarJson = await this.generalService.readFile(mintedCharacter.uri);

    character.mintedAvatarClass = avatarJson?avatarJson.itemclass:'';
    character.mintedAvatarName = avatarJson?avatarJson.name:'';
    character.mintedAvatarImageUrl = avatarJson?avatarJson.image:'';

    console.log('avatarJson-->',avatarJson)

    return character;


  }

  async saveHash(user,body){

    let transaction = await this.transactionModel.findOne({'hash':body.hash})

    if(transaction){

      throw new BadRequestException("Transaction Already exists");

    }

    let transaction_obj = {
      'hash':body.hash,
      'network': body.network,
      'fromAddress':user.metaMaskWalletAddress,
      'userId':user.id
    }

    await this.transactionModel.create(transaction_obj);

    return true;

  }

  async verifyHash(user,body){

    let domicoins_transaction = await this.transactionModel.findOne({'hash':body.hash,'status':TransactionStatus.PENDING})

    if(!domicoins_transaction){

      return new NotFoundException("Invalid hash")

    }

    let result = await this.generalService.verifyTransaction(domicoins_transaction)

    if(!result){

      domicoins_transaction.status = TransactionStatus.CANCELLED;
      await domicoins_transaction.save();
      return;
    
    }

    domicoins_transaction.status = TransactionStatus.COMPLETED;
    await domicoins_transaction.save();

    user.domicoins = user.domicoins + (+result);
    await user.save();

    await this.generalService.storeCoinExchange({"coin": +result,type:CoinExchangeType.BUY,network: domicoins_transaction.network , status:true},user)

    return this.authService.serializeUser(user,user.accessToken);
  
  }


  async removeWalletAddress(userDoc){

    userDoc.metaMaskWalletAddress = null;

    await userDoc.save();

    return userDoc;

  }

  async checkUserWithWalletAddress(userDoc,dto){

    let resp = dto.metaMaskWalletAddress.match(/^0x[a-fA-F0-9]{40}$/g);
    if(!resp){
      throw new BadRequestException("your wallet is not correct format");
    }
    let user_exists_with_walletAddress = await this.userModel.findOne({metaMaskWalletAddress:dto.metaMaskWalletAddress,_id:{$ne:userDoc._id}});

    if(user_exists_with_walletAddress){

      throw new BadRequestException("This Wallet Address is already associatedetamask  with another user");

    }

  }

  async getUserByParams(query,user){

    query['_id'] = {"$ne":user._id} 
    let resp = query.metaMaskWalletAddress.match(/^0x[a-fA-F0-9]{40}$/g);
    if(!resp){
     return true;
    }
    if(!user.is_admin && process.env.ADMIN_WALLET_ADDRESS.toLowerCase() === query.metaMaskWalletAddress){
      return true;
    }
    if(user.is_admin && process.env.ADMIN_WALLET_ADDRESS.toLowerCase() !== query.metaMaskWalletAddress){
      return true;
    }
    
    let userWithMetaMaskAddress = await this.userModel.findOne(query)

    if(!userWithMetaMaskAddress && user.metaMaskWalletAddress === "true"){
      user.metaMaskWalletAddress = query.metaMaskWalletAddress;
      await user.save();
    }
    
    return userWithMetaMaskAddress?true:false;

  }

  async updatePassword(userDoc:UserDocument,dto:UpdatePasswordDto){

      const user = await this.userModel.findOne({'_id':userDoc.id}, '+password');
      
      const verify_password = await this.authUtilService.checkPassword(user.password,dto.old_password);

      if(!verify_password){
        throw new BadRequestException("Invalid Password");
      }
    
      user.password = await this.authUtilService.hashPassword(dto.password);

      await user.save();

      return user;

  }

  async getUser(id: string) {
    let user_exist = await this.getUserById(id);
    
    if (!user_exist) throw new NotFoundException('User not found');
    
    let user =  await this.authService.serializeUser(user_exist,user_exist.accessToken);

    let quarter:any = await this.generalService.lastQuarter()

    let aggregation = [
      {
        $match: {
          createdAt: {
            $gte: new Date(quarter.startDate),
            $lte: new Date(quarter.endDate),
          },
          'userIds.id': id,
        },
      },
      {
        $group: {
          _id: null,
          gamesWon: {
            $sum: {
              $cond: {
                if: {
                  $eq: ['$winnerId', id],
                },
                then: 1,
                else: 0,
              },
            },
          },
          gamesPlayed: {
            $sum: 1,
          },
          tournamentWon: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    { $eq: ['$gameType', GameType.TOURNAMENT] },
                    { $eq: ['$winnerId', id] },
                  ],
                },
                then: 1,
                else: 0,
              },
            },
          },
          tournamentPlayed: {
            $sum: {
              $cond: {
                if: {
                  $eq: ['$gameType', GameType.TOURNAMENT],
                },
                then: 1,
                else: 0,
              },
            },
          },
          games: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $project: {
          stats: {
            gamesWon: '$gamesWon',
            gamesPlayed: '$gamesPlayed',
            tournamentWon: '$tournamentWon',
            tournamentPlayed: '$tournamentPlayed',
          },
          games: 1,
        },
      },
      {
        $unwind: '$games',
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ['$games', '$stats'],
          },
        },
      },
      {
        $unwind: '$gamePoints',
      },
      {
        $group: {
          _id: '$gameRule',
          MMR: {
            $sum: '$gamePoints.finalPoints',
          },
          gamesWon: {
            $first: '$gamesWon',
          },
          gamesPlayed: {
            $first: '$gamesPlayed',
          },
          tournamentWon: {
            $first: '$tournamentWon',
          },
          tournamentPlayed: {
            $first: '$tournamentPlayed',
          },
        },
      },
      {
        $project: {
          _id: 0,
          gameRule: '$_id',
          MMR: 1,
          gamesWon: { $ifNull: ['$gamesWon', 0] },
          gamesPlayed: { $ifNull: ['$gamesPlayed', 0] },
          gamesWonPercentage: {
            $cond: {
              if: {
                $or: [
                  { $in: ['$gamesPlayed', [0, null]] },
                  { $in: ['$gamesWon', [0, null]] },
                ],
              },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: ['$gamesWon', '$gamesPlayed'],
                  },
                  100,
                ],
              },
            },
          },
          gamesLost: {
            $subtract: [
              { $ifNull: ['$gamesPlayed', 0] }, 
              { $ifNull: ['$gamesWon', 0] }, 
            ],
          },
          tournamentWon: { $ifNull: ['$tournamentWon', 0] },
          tournamentPlayed: { $ifNull: ['$tournamentPlayed', 0] },
          tournamentLost:{
            $subtract: [
              { $ifNull: ['$tournamentPlayed', 0] }, 
              { $ifNull: ['$tournamentWon', 0] }, 
            ],
          },
          tournamentPercentage: {
            $cond: {
              if: {
                $or: [
                  { $in: ['$tournamentPlayed', [0, null]] },
                  { $in: ['$tournamentWon', [0, null]] },
                ],
              },
              then: 0,
              else: {
                $multiply: [
                  {
                    $divide: ['$tournamentWon', '$tournamentPlayed'],
                  },
                  100,
                ],
              },
            },
          }
        },
      },
    ];
    
    
    
    let aggregationResult = await this.gameModel.aggregate(aggregation)

    let games = {
      gamesWon: aggregationResult[0]?.gamesWon ?? 0,
      gamesPlayed: aggregationResult[0]?.gamesPlayed ?? 0,
      gamesLost: aggregationResult[0]?.gamesLost ?? 0,
      gamesWonPercentage: aggregationResult[0]?.gamesWonPercentage ? aggregationResult[0]?.gamesWonPercentage.toFixed(2) : (0).toFixed(2) 
    }

    let tournamentStats = {
      tournamentPlayed: aggregationResult[0]?.tournamentPlayed ?? 0,
      tournamentWon: aggregationResult[0]?.tournamentWon ?? 0, 
      tournamentLost: aggregationResult[0]?.tournamentLost ?? 0,
      tournamentPercentage: aggregationResult[0]?.tournamentPercentage ? aggregationResult[0]?.tournamentPercentage.toFixed(2) : (0).toFixed(2)
    }

    let userGameModeScoreInfo = quarter.GameModes.map(({gameRulesName,ranges,basePoints}) => ({
      ...this.generalService.assignMedals([{ id, MMR: (aggregationResult.find(({ gameRule }) => gameRule === gameRulesName)?.MMR || 0) }], ranges, basePoints)[0],
      GameMode: gameRulesName
    }));
    
    delete user.accessToken;
    const data = { user, games, tournamentStats ,userGameModeScoreInfo  };
    const message = 'User Fetched Successfully';
    return { message, data };
    
  }

  async getUserDomicoins(id: string) {
    let user_exist = await this.getUserById(id);
    if (!user_exist) {
      throw new NotFoundException('User not found');
    }
    return { Domicoins: user_exist.domicoins };
    
  }

  async getUserById(id){

    let user = await this.userModel.findOne({'_id':id});

    if(!user){

      throw new NotFoundException("User Not Found")

    }

    if(user.is_admin){

      user.metaMaskWalletAddress = process.env.MARKETPLACE_WALLET_ADDRESS

    }
    
    return user

  }

  async getAdminUser(){

    let user = await this.userModel.findOne({'is_admin':true});
    
    return user

  }

  async setAvatarCategories(user: UserDocument, dto: SetAvatarCategoriesDto) {
    const { avatarCategories, avatarGender } = dto;
    user.avatarCategories = avatarCategories;
    user.avatarGender = avatarGender;

    user = await user.save();

    const defaultCharacters =
      await this.avatarBuilderService.getDefaultAvatars();

    const avatarPrice = await this.avatarBuilderService.getAvatarPrice();

    console.log(avatarPrice);

    return {
      avatarCategories: user.avatarCategories || [],
      avatarGender: user.avatarGender || Gender.MALE,
      isNewUser: !(user.avatarCategories && user.avatarCategories.length > 0),
      maleDefaultAvatar: defaultCharacters.maleDefaultAvatar || [],
      femaleDafaultAvatar: defaultCharacters.femaleDafaultAvatar || [],
      maleAvatarPrice: avatarPrice.male_price || 0,
      femaleAvatarPrice: avatarPrice.female_price || 0,
      femaleCode:avatarPrice.female_code || 'avatar-female-class-a',
      maleCode:avatarPrice.male_code || 'avatar-male-class-a'
    };
  }


  async updateWhiteList(user: UserDocument) {
    user.whiteListed = false;
    await user.save();
    return { message: 'Whitelist removed Successfully' };
  }

  async getAvatarCategories(user: UserDocument) {
    const avatarGender = user.avatarGender;
    const avatarCategories = user.avatarCategories || [];

    const defaultCharacters =
      await this.avatarBuilderService.getDefaultAvatars();

    const avatarPrice = await this.avatarBuilderService.getAvatarPrice();

    return {
      avatarCategories: avatarCategories || [],
      avatarGender: avatarGender || Gender.MALE,
      isNewUser: !(user.avatarCategories && user.avatarCategories.length > 0),
      maleDefaultAvatar: defaultCharacters.maleDefaultAvatar || [],
      femaleDafaultAvatar: defaultCharacters.femaleDafaultAvatar || [],
      maleAvatarPrice: avatarPrice.male_price || 0,
      femaleAvatarPrice: avatarPrice.female_price || 0,
      femaleCode:avatarPrice.female_code || 'avatar-female-class-a',
      maleCode:avatarPrice.male_code || 'avatar-male-class-a'
    };
  }

  async getUserAssetCategories(user: UserDocument) {
    const defaultAssets = await this.assetBuilderService.getDefaultAssets();

    return {
      assetGender: user.assetGender,
      characterId: user.characterId,
      assetCategories: user.assetCategories,
      maleDefaultAsset: defaultAssets.maleDefaultAsset,
      femaleDefaultAsset: defaultAssets.femaleDefaultAsset,
    };
  }

  async setAssetCategories(user: UserDocument, dto: SetAssetCategoriesDto) {

    await this.userModel.updateOne({'_id':user.id},{$set:dto})

    return dto;
  }

  async updateDomicoins(user: UserDocument, coins: number) {
    return user;
  }

  async getAllUsers(){

    return this.userModel.find();


  }

  async getUsersWithWallet(user){
    return this.userModel.find({'metaMaskWalletAddress':{"$exists":true, $ne: user.metaMaskWalletAddress}});

  }

}
