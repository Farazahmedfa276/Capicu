import { MailerModule } from '@nestjs-modules/mailer';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { JsonWebTokenModule } from 'src/json-web-token/json-web-token.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/user.schema';
import { AppService } from 'src/app.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    JsonWebTokenModule,
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          defaults: {
            from: configService.get<string>('SMTP_FROM'),
          },
          transport: {
            host: configService.get<string>('SMTP_HOST'),
            port: configService.get<number>('SMTP_PORT'),
            pool: true,
            tls: {
              host: configService.get<string>('SMTP_HOST'),
              port: configService.get<number>('SMTP_PORT'),
            },
            auth: {
              user: configService.get<string>('SMTP_USERNAME'),
              pass: configService.get<string>('SMTP_PASSWORD'),
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
  ],
  providers: [EmailService, AppService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {}
