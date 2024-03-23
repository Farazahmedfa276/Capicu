import { Body, Controller, Get, Post, Res, UseGuards, Req, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { JwtAuthGuard } from 'src/json-web-token/jwt-auth-guard';
import { GetUser } from 'src/users/get-user.decorator';
import { UserDocument } from 'src/users/user.schema';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardOptional } from 'src/json-web-token/jwt-auth-guard-optional';
import * as _ip from 'ipaddr.js';
import { Request } from 'express';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  static getAuthGuardIPAddress: any;
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) { }

  

  

  @Post('/mobile/socialLogin')
  async socialLogin(@Body() body: any) {
    return await this.authService.mobileSocialLogin(body);
  }

 

}
