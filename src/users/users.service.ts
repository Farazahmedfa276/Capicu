import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
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
   
    
    
    private authService:AuthService,
    @InjectModel(Game.name)
    private gameModel:Model<GameDocument>,
    
    @InjectModel(Quarter.name)
    private quarterModal: Model<QuarterDocument>
    
    ) {}

  async updateUser(userDoc: UserDocument, dto) {

    
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

    return user

  }

  

  


  

  

  

  

  async updateDomicoins(user: UserDocument, coins: number) {
    return user;
  }

  

  

}
