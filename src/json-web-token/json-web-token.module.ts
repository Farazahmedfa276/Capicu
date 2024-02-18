import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/user.schema';
import { JsonWebTokenService } from './json-web-token.service';
import { JwtAuthGuard } from './jwt-auth-guard';
import { JwtAuthGuardOptional } from './jwt-auth-guard-optional';
import { JwtStrategy } from './jwt-strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    JsonWebTokenService,
    JwtStrategy,
    JwtAuthGuard,
    JwtAuthGuardOptional,
  ],
  exports: [JsonWebTokenService],
})
export class JsonWebTokenModule {}
