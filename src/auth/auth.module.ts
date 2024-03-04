import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../users/user.schema';
import { EmailModule } from 'src/email/email.module';
import { JsonWebTokenModule } from 'src/json-web-token/json-web-token.module';
import { GoogleOauthGuard } from './google-oauth-guard';
import { AuthUtilService } from './auth.utils.service';

@Module({
  imports: [
    JsonWebTokenModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      
    ]),
    EmailModule,
  ],
  providers: [
    AuthService,
    AuthUtilService,
    GoogleOauthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthUtilService,AuthService],
})
export class AuthModule {}
