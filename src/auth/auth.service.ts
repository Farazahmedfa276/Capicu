import {
  BadRequestException,
  CACHE_MANAGER,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/user.schema';
import { promisify } from 'util';
import { SignUpDto } from './dtos/sign-up.dto';

import { JwtAccessTokenPayload } from '../json-web-token/jwt-access-token-payload';
import { JsonWebTokenService } from 'src/json-web-token/json-web-token.service';
import { EmailService } from 'src/email/email.service';

//import { GeneralService } from 'src/general/general.service';
import * as moment from 'moment';

import { Cache } from 'cache-manager';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jsonWebTokenService: JsonWebTokenService,
    private emailService: EmailService,
    
    
  ) {}

  

  async mobileSocialLogin(signUpDto: any) {
    const {
      displayName,
      userId,
      email,
      authProvider
    } = signUpDto;

    const existingUser = await this.userModel.findOne({
      email,
    });

    if (existingUser){

      if(!existingUser?.googleUserId && existingUser.isEmailVerified){
        throw new BadRequestException("Please signin using password.")
      }

      const accessToken = await this.generateAccessToken(existingUser);
  
      let result = await this.serializeUser(existingUser, accessToken);

      return {data:{user:result}}
      
    } else {

      let username = email.split("@")

      let newUser = new this.userModel({
        googleUserId:userId,
        firstName : displayName || username[0],
        userName : username[0],
        email,
        authProvider,
        isTermsOfServiceAndPrivacyPolicyAccepted:true,
        createdAt: new Date(),
      });

      newUser = await newUser.save();

      const accessToken = await this.generateAccessToken(newUser);

      this.emailService.sendVerificationEmail(newUser);

      let result = await this.serializeUser(newUser, accessToken);

      return {data:{user:result}}
      
    }
   
  }

  async serializeUser(user: UserDocument, accessToken: string) {
    // console.log(accessToken,"accessToken")
    //let user_game_center = await this.gameCenterModel.count({'ownerId':user.id,'status':true})

    //let promotion = await this.generalService.getLaunchDate()

    user.gameCenters = null;
    //user.discount = promotion?promotion.discount:0;
    const {
      __v,
      password,
      binanceWalletAddress,
      googleUserId,
      ...serializedUser
    } = user.toJSON();

   // let assetPrices = await this.assetPriceModel.find({},{"class":1,"image":1})

    //let avatarPrices = await this.avatarPriceModel.find({});
    // console.log(googleUserId,"googleUserId")
    return { ...serializedUser, accessToken };
  }

  private async generateAccessToken(user: UserDocument) {
    const payload: JwtAccessTokenPayload = { userId: user._id };
    const accessToken =
      await this.jsonWebTokenService.generateToken<JwtAccessTokenPayload>(
        payload,
      );
    user.accessToken = accessToken;
    if(!user.userName){
    let username = user.email.split("@");
    user.userName = username[0];
    }
    // console.log(user,"User")
    await user.save();
    return accessToken;
  }
}
