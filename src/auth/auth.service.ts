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
import { MetaMaskSignInDto } from './dtos/meta-mask-sign-in.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { BinanceSignInDto } from './dtos/binance-sign-in.dto';
import { JwtAccessTokenPayload } from '../json-web-token/jwt-access-token-payload';
import { JsonWebTokenService } from 'src/json-web-token/json-web-token.service';
import { EmailService } from 'src/email/email.service';
import { PasswordResetCodeDto } from './dtos/password-reset-code.dto';
import { verifyMobileVerificationCodeDto } from './dtos/verify-mobile-verification-code.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { GeneralService } from 'src/general/general.service';
import * as moment from 'moment';
import { AuthUtilService } from './auth.utils.service';
import { SetPasswordDto } from './dtos/set-password.dto';
import { Cache } from 'cache-manager';
import { AssetPrice, AssetPriceDocument } from 'src/asset-builder/asset-price.schema';
import { GameCenter, GameCenterDocument } from 'src/game-center/game-center.schema';
import { AvatarPrice, AvatarPriceDocument } from 'src/avatar-builder/avatar-price.schema';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(AssetPrice.name) private assetPriceModel: Model<AssetPriceDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private generalService: GeneralService,
    private jsonWebTokenService: JsonWebTokenService,
    private emailService: EmailService,
    private authUtilService: AuthUtilService,
    @InjectModel(GameCenter.name)
    private gameCenterModel:Model<GameCenterDocument>,
    @InjectModel(AvatarPrice.name)
    private avatarPriceModel:Model<AvatarPriceDocument>
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const {
      firstName,
      lastName,
      userName,
      email,
      isEmailVerified,
      password: unHashedPassword,
      isTermsOfServiceAndPrivacyPolicyAccepted,
    } = signUpDto;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser?.email === email && existingUser?.userName === userName) {
      throw new BadRequestException('Email and Username in use.');
    }

    if (existingUser?.email === email) {
      throw new BadRequestException('Email in use.');
    }

    if (existingUser?.userName === userName) {
      throw new BadRequestException('Username in use.');
    }

    const hashedPassword = await this.authUtilService.hashPassword(
      unHashedPassword,
    );

    if (!isTermsOfServiceAndPrivacyPolicyAccepted) {
      throw new BadRequestException(
        'Terms of service and privacy policy is not accepted',
      );
    }

    let newUser = new this.userModel({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      isTermsOfServiceAndPrivacyPolicyAccepted,
      createdAt: new Date(),

      
    });

    newUser = await newUser.save();

    const accessToken = await this.generateAccessToken(newUser);

    //this.emailService.sendVerificationEmail(newUser);

    return this.serializeUser(newUser, accessToken);
  }

  async mobileSocialLogin(signUpDto: any) {
    const {
      displayName,
      userId,
      email,
      authProvider
    } = signUpDto;

    const existingUser = await this.userModel.findOne({
      email,
      // googleUserId: { $exists: false },
      // isEmailVerified: true,
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

  async mobileSignUp(signUpDto: any) {
    const {
      firstName,
      lastName,
      userName,
      email,
      password: unHashedPassword,
      isTermsOfServiceAndPrivacyPolicyAccepted,
    } = signUpDto;

    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser?.email === email && existingUser?.userName === userName) {
      throw new BadRequestException('Email and Username in use.');
    }

    if (existingUser?.email === email) {
      throw new BadRequestException('Email in use.');
    }

    if (existingUser?.userName === userName) {
      throw new BadRequestException('Username in use.');
    }

    const hashedPassword = await this.authUtilService.hashPassword(
      unHashedPassword,
    );

    if (!isTermsOfServiceAndPrivacyPolicyAccepted) {
      throw new BadRequestException(
        'Terms of service and privacy policy is not accepted',
      );
    }

    let newUser = new this.userModel({
      firstName,
      lastName,
      userName,
      email,
      password: hashedPassword,
      isTermsOfServiceAndPrivacyPolicyAccepted,
      createdAt: new Date(),
    });

    newUser = await newUser.save();

    const accessToken = await this.generateAccessToken(newUser);

    await this.emailService.sendMobileSignupCodeEmail(newUser.email);

    let result = await this.serializeUser(newUser, accessToken);

    return {data:{user:result}}
  }

  async verifyMobileVerificationCode (passwordResetCodeDto: verifyMobileVerificationCodeDto) {
    const { email, code } = passwordResetCodeDto;

    const user = await this.userModel.findOne(
      { email },
      '+mobileVerifyCode',
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if the mobile verification code and its expiration time exist
    if (!user?.mobileVerifyCode || !user.mobileVerifyCode?.code || !user.mobileVerifyCode?.expiresAt) {
      throw new BadRequestException('Mobile verification code not be found or expired');
    }

    // Check if the code has expired
    if (user.mobileVerifyCode?.expiresAt < new Date()) {
      throw new BadRequestException('Mobile verification code has expired');
    }

    if (user?.mobileVerifyCode?.code !== code) {
      //await this.authUtilService.checkUserBlockStatus(user);
       throw new BadRequestException('Invalid code');
    }

    user.mobileVerifyCode = null;
    user.isEmailVerified = true

    await user.save();

    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  async isWhiteListed(chainId) {
    if (chainId === process.env.BNB_CHAINID) {
      let query = {
        promotion_status: 1
      }
      const promotion = this.generalService.getLaunchDate(query);
      return promotion?true:false;
    }
    if(chainId === process.env.POLYGON_CHAINID){
      let query = {
        promotion_polygon_status:1
      }
      const promotion = await this.generalService.getLaunchDate(query);
      return promotion?true:false;
    }
  }

  async resendMobileVerificationCode (  body  ) {
    console.log("body---->",body)

    const {email} = body

    let existingUser = await this.userModel.findOne({ email })

    if( !existingUser ) throw new BadRequestException("User not found");

    if( existingUser?.isEmailVerified) throw new BadRequestException("Email already verified");

    if( existingUser?.googleUserId) throw new BadRequestException("GoogleId for this Account already exists");

    await this.emailService.sendMobileSignupCodeEmail(email);

    return { message: 'Email OTP resended' }
    
  } 

  // async resendMobileVerificationCode ( user ) {

  //   if( !user?.email ) throw new BadRequestException("Email not found");

  //   if( user?.isEmailVerified) throw new BadRequestException("Email is already verified");

  //   if( user?.googleUserId) throw new BadRequestException("GoogleId for this Account already exists");

  //   await this.emailService.sendMobileSignupCodeEmail(user.email);

  //   return { message: 'Email OTP resended' }
    
  // } 

  async signIn(signInDto: SignInDto) {
    const { email, password: unHashedPassword } = signInDto;

    const existingUser = await this.userModel.findOne(
      { email },
      '+password +isEmailVerified +googleUserId',
    );

    if (!existingUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (new Date().getTime() < existingUser.blockTimer || existingUser.status == false || !existingUser.status) {
      throw new ForbiddenException('Your account has been blocked');
    }

    if (existingUser?.googleUserId) {
      throw new BadRequestException('Please sign in using google.');
    }

    const storedPassword = existingUser.password;

    const salt = storedPassword?.split('.')[0];

    const hash = (await scrypt(unHashedPassword, salt, 32)) as Buffer;
    const hashedPassword = `${salt}.${hash.toString('hex')}`;

    if (storedPassword !== hashedPassword) {
      await this.blockUser(existingUser);

      throw new UnauthorizedException('Invalid email or password');
    }

    if (existingUser.blockCount) {
      await this.userModel.updateOne(
        { _id: existingUser.id },
        {
          blockCount: 0,
          blockTimer: 0,
        },
      );
    }

    const accessToken = await this.generateAccessToken(existingUser);

    return this.serializeUser(existingUser, accessToken);
  }

  async mobileSignIn(signInDto: SignInDto) {
    const { email, password: unHashedPassword } = signInDto;

    const existingUser = await this.userModel.findOne(
      { email },
      '+password +isEmailVerified +googleUserId',
    );

    if (!existingUser) {
      throw new UnauthorizedException('The email does not exist');
    }

    if (new Date().getTime() < existingUser.blockTimer || existingUser.status == false || !existingUser.status) {
      throw new ForbiddenException('Your account has been blocked');
    }

    if (existingUser?.googleUserId) {
      throw new BadRequestException('Please sign in using google.');
    }

    if(!existingUser?.isEmailVerified){
      await this.emailService.sendMobileSignupCodeEmail(email)

      throw new BadRequestException('Email sent to your account please verify your email');
    }

    const storedPassword = existingUser.password;

    const salt = storedPassword?.split('.')[0];

    const hash = (await scrypt(unHashedPassword, salt, 32)) as Buffer;
    const hashedPassword = `${salt}.${hash.toString('hex')}`;

    if (storedPassword !== hashedPassword) {
      await this.blockUser(existingUser);

      throw new UnauthorizedException('Invalid email or password');
    }

    if (existingUser.blockCount) {
      await this.userModel.updateOne(
        { _id: existingUser.id },
        {
          blockCount: 0,
          blockTimer: 0,
        },
      );
    }

    const accessToken = await this.generateAccessToken(existingUser);


    let result = await this.serializeUser(existingUser, accessToken);

    return {data:{user:result}}
  }

  async verifyEmail(user: UserDocument) {
    const email =
      (await this.cacheManager.get<{ email: string }>(user?.email)) || null;

    if (email) {
      return;
    }

    await this.cacheManager.set<{ email: string }>(
      user?.email,
      { email: user?.email },
      30000,
    );

    this.emailService.sendVerificationEmail(user);
  }

  async blockUser(user: UserDocument) {
    // console.log(user,"USER")
    let block_count = user.blockCount;

    let current_date = new Date();

    if (current_date.getTime() < user.blockTimer) {
      throw new ForbiddenException('Your account has been blocked');
    }

    let time_to_set = new Date();

    time_to_set.setMinutes(current_date.getMinutes() + 3);

    let blockTimer = block_count >= 5 ? time_to_set.getTime() : 0;

    console.log('blockTimer-->', blockTimer);

    await this.userModel.updateOne(
      { _id: user.id },
      {
        blockCount: block_count < 5 ? ++block_count : 0,
        blockTimer: blockTimer,
      },
    );
  }

  async signInWithGoogle(user: any) {
    // console.log(user,'social user')
    if (user instanceof BadRequestException) {
      return { error: 'Please sign in using password.' };
    }
    const accessToken = await this.generateAccessToken(user);
    return this.serializeUser(user, accessToken);
  }

  async verifyPasswordResetCode(passwordResetCodeDto: PasswordResetCodeDto) {
    const { email, code } = passwordResetCodeDto;

    const user = await this.userModel.findOne(
      { email },
      '+passwordResetCode',
    );

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.authUtilService.checkUserStatus(user);

    if (user.passwordResetCode !== code) {
      await this.authUtilService.checkUserBlockStatus(user);

      throw new BadRequestException('Invalid code');
    }

    user.passwordResetCode = null;

    await user.save();

    const accessToken = await this.generateAccessToken(user);

    return { accessToken };
  }

  async resetPassword(user: UserDocument, resetPasswordDto: ResetPasswordDto) {
    const { newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Password not matched');
    }

    const hashedPassword = await this.authUtilService.hashPassword(newPassword);

    user.password = hashedPassword;

    const userWithNewPassword = await user.save();

    const accessToken = await this.generateAccessToken(userWithNewPassword);

    return this.serializeUser(userWithNewPassword, accessToken);
  }

  async setPassword(setPasswordDto: SetPasswordDto) {
    const { token: setPasswordToken, password: unHashedPassword } =
      setPasswordDto;

    const user = await this.userModel.findOne({ setPasswordToken });

    if (!user) {
      throw new ForbiddenException();
    }

    await this.authUtilService.checkUserBlockStatus(user);

    user.password = await this.authUtilService.hashPassword(unHashedPassword);
    user.isEmailVerified = true;
    user.setPasswordToken = null;

    await user.save();
  }

  async serializeUser(user: UserDocument, accessToken: string) {
    // console.log(accessToken,"accessToken")
    let user_game_center = await this.gameCenterModel.count({'ownerId':user.id,'status':true})

    //let promotion = await this.generalService.getLaunchDate()

    user.gameCenters = user_game_center;
    //user.discount = promotion?promotion.discount:0;
    const {
      __v,
      password,
      binanceWalletAddress,
      googleUserId,
      ...serializedUser
    } = user.toJSON();

    let assetPrices = await this.assetPriceModel.find({},{"class":1,"image":1})

    let avatarPrices = await this.avatarPriceModel.find({});
    // console.log(googleUserId,"googleUserId")
    return { ...serializedUser, accessToken,assetPrices,avatarPrices };
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
