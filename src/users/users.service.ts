import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { AuthUtilService } from 'src/auth/auth.utils.service';
import { Game, GameDocument } from 'src/game/game.schema';
import { GameService } from 'src/game/game.service';
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
   
    private authUtilService:AuthUtilService,
    
    private authService:AuthService,
    @InjectModel(Game.name)
    private gameModel:Model<GameDocument>,
    
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

    
    let games = {
      gamesWon: 0,
      gamesPlayed:  0,
      gamesLost:  0,
      
    }

    
    
    delete user.accessToken;
    const data = { user, games  };
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

  


  async updateWhiteList(user: UserDocument) {
    user.whiteListed = false;
    await user.save();
    return { message: 'Whitelist removed Successfully' };
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
