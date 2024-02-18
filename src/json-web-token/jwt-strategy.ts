import { ExtractJwt, Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { JwtAccessTokenPayload } from './jwt-access-token-payload';
import { User, UserDocument } from 'src/users/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtAccessTokenPayload) {
    const { userId } = payload;
    const user = await this.userModel.findOne({'_id':userId}, '+isEmailVerified');
    return user;
  }
}
