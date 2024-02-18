import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { EmailVerificationQueryDto } from './dtos/email-verification-query.dto';
import { PasswordResetCodeDto } from './dtos/password-reset-code.dto';
import { EmailService } from './email.service';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private configService: ConfigService,
  ) {}

  @Get('verify')
  async verifyEmail(
    @Query() { token }: EmailVerificationQueryDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { emailVerificationId } = await this.emailService.verify(token);
    return res.redirect(
      `${this.configService.get<string>(
        'WEB_ORIGIN',
      )}/#/?emailVerificationId=${emailVerificationId}`,
    );
  }

  @Get('verify/callback/:emailVerificationId')
  async verifyEmailCallback(
    @Param('emailVerificationId') emailVerificationId: string,
  ) {
    return await this.emailService.emailVerifyCallback(emailVerificationId);
  }

  @Post('sendPasswordResetCode')
  async sendPasswordResetCode(@Body() { email }: PasswordResetCodeDto) {
    return await this.emailService.sendPasswordResetCodeEmail(email);
  }

  @Post('sendSetPasswordLink')
  async sendSetPasswordLink(@Body() { email }: PasswordResetCodeDto) {
    return await this.emailService.sendSetPasswordLinkEmail(email);
  }

  @Post('sendAdminEmails')
  async sendAdminEmails(@Body() body) {
    return await this.emailService.sendAdminEmails(body);
  }
  
  

 
}
