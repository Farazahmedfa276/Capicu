import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../users/user.schema';
import { EmailModule } from 'src/email/email.module';
import { JsonWebTokenModule } from 'src/json-web-token/json-web-token.module';

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
    
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}