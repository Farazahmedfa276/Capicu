import { Body, Controller, Get, Post, Res, UseGuards, Req, Ip } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { PasswordResetCodeDto } from './dtos/password-reset-code.dto';
import { JwtAuthGuard } from 'src/json-web-token/jwt-auth-guard';
import { GetUser } from 'src/users/get-user.decorator';
import { UserDocument } from 'src/users/user.schema';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { GoogleOauthGuard } from './google-oauth-guard';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { SetPasswordDto } from './dtos/set-password.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuardOptional } from 'src/json-web-token/jwt-auth-guard-optional';
import { resendMobileVerificationCodeDto } from './dtos/resend-mobile-verification-otp.dto';
import { verifyMobileVerificationCodeDto } from './dtos/verify-mobile-verification-code.dto';
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

  @Post('/signUp')
  async signUp(@Body() body: SignUpDto) {
    return await this.authService.signUp(body);
  }

  @Post('/mobile/signUp')
  async mobileSignUp(@Body() body: SignUpDto) {
    return await this.authService.mobileSignUp(body);
  }

  @Post('/mobile/socialLogin')
  async socialLogin(@Body() body: any) {
    return await this.authService.mobileSocialLogin(body);
  }

  @Post('/mobile/verifyEmail')
  async verifyMobileVerificationCode(@Body() body:verifyMobileVerificationCodeDto) {
    return await this.authService.verifyMobileVerificationCode(body);
  }

  // @Post('/mobile/resendOTPverificationCode')
  // @ApiBearerAuth('accessToken')
  // @UseGuards(JwtAuthGuard)
  // async resendMobileVerificationCode(
  //   @GetUser() userDoc: UserDocument
  // ) {
  //   return await this.authService.resendMobileVerificationCode(userDoc);
  // }

  @Post('/mobile/resendOTPverificationCode')
  async resendMobileVerificationCode(
    @Body() body: resendMobileVerificationCodeDto
  ) {
    return await this.authService.resendMobileVerificationCode(body);
  }

  @Post('/signIn')
  async signIn(@Body() body: SignInDto) {
    return await this.authService.signIn(body);
  }

  @Post('/mobile/signIn')
  async mobileSignIn(@Body() body: SignInDto) {
    return await this.authService.mobileSignIn(body);
  }

  @Get('/verifyEmail')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuardOptional)
  async verifyEmail(@GetUser() userDoc: UserDocument) {
    const message = 'Verification Email Sent.';
    await this.authService.verifyEmail(userDoc);
    return { message };
  }

  @Get('/google')
  @ApiBearerAuth('accessToken')
  @UseGuards(GoogleOauthGuard)
  signInWithGoogle() { }

  @Get('/google/callback')
  @ApiBearerAuth('accessToken')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(
    @GetUser() userDoc: any,
    @Res({ passthrough: true }) res: Response,
  ) {

     console.log(res,'controller')
    const result = await this.authService.signInWithGoogle(userDoc);
    console.log(result,"RESULT")
    if ((result as { accessToken: string })?.accessToken) {
      return res.redirect(
        `${this.configService.get<string>('WEB_ORIGIN')}/#/?accessToken=${(result as { accessToken: string }).accessToken
        }`,
      );
    }

    return res.redirect(
      `${this.configService.get<string>('WEB_ORIGIN')}/#/?error=${(result as { error: string }).error
      }`,
    );
  }

  @Post('/resetPassword')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async resetPassword(
    @GetUser() userDoc: UserDocument,
    @Body() body: ResetPasswordDto,
  ) {
    return await this.authService.resetPassword(userDoc, body);
  }

  @Post('/verifyPasswordResetCode')
  async verifyPasswordResetCode(@Body() body: PasswordResetCodeDto) {
    return await this.authService.verifyPasswordResetCode(body);
  }

  @Post('/setPassword')
  async setPassword(@Body() body: SetPasswordDto) {
    const message = 'Password Changed Successfully';
    await this.authService.setPassword(body);
    return { message };
  }

  // @Get('/ip')
  // @ApiBearerAuth('accessToken')
  // // @UseGuards(JwtAuthGuard)
  // // @UseGuards(AuthGuard)
  // async getAuthGuardIPAddress(@Ip() ip: string): Promise<string> {
  //   const addr = _ip.parse(ip).toString()
  //   console.log(addr,'---> ip address')
  //   // return _ip.parse(ip).toString()
  //   return addr
  // }

  @Get('/ip')
  getAuthGuardIPAddress(@Req() request: Request): string {
    const ipAddress = request.ip;
    // console.log(ipAddress)
    return `The incoming request IP address is: ${ipAddress}`;
  }

}
