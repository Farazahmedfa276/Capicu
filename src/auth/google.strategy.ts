import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { User, UserDocument } from 'src/users/user.schema';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_SECRET'),
      callbackURL: `${configService.get<string>(
        'APP_ORIGIN',
      )}/api/auth/google/callback`,
      scope: ['email', 'profile'],
      proxy: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const {
      id: googleUserId,
      given_name: firstName,
      family_name: lastName,
      verified: isEmailVerified,
      picture: profileImage,
      provider: authProvider,
      email,
    } = profile;

    const existingEmail = await this.userModel.findOne({
      email,
      googleUserId: { $exists: false },
      isEmailVerified: true,
    });

    if (existingEmail) {
      done(new BadRequestException('Please signin using password.'), null, {
        message: 'Please signin using password.',
      });
    } else {
      let user = await this.userModel.findOne({
        googleUserId,
        email,
      });

      let message = 'User Signin';

      if (!user) {
        user = new this.userModel({
          googleUserId,
          email,
          firstName,
          lastName,
          isEmailVerified,
          profileImage,
          authProvider,
          createdAt: new Date(),
        });

        user = await user.save();

        this.userModel.deleteMany({ email, isEmailVerified: false });

        message = 'User Signup';
      }

      done(null, user, { message });
    }
  }
}
