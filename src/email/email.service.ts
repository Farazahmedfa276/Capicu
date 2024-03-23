import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JsonWebTokenService } from 'src/json-web-token/json-web-token.service';
import { JwtEmailVerificationPayload } from 'src/json-web-token/jwt-email-verification-payload';
import { User, UserDocument } from 'src/users/user.schema';
import IOTP from 'otp';
import { nanoid } from 'nanoid';
import { AuthUtilService } from 'src/auth/auth.utils.service';
        

const OTP = require('otp');

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailerService: MailerService,
    private configService: ConfigService,
    private jsonWebTokenService: JsonWebTokenService,
    private authUtilService: AuthUtilService,
  ) {}

  async contactUs(data) {}

  async sendVerificationEmail(user: UserDocument) {
    const url = this.configService.get<string>('APP_ORIGIN');

    const jwtEmailVerificationPayload: JwtEmailVerificationPayload = {
      id: user.id,
      email: user.email,
    };

    const token =
      await this.jsonWebTokenService.generateToken<JwtEmailVerificationPayload>(
        jwtEmailVerificationPayload,
      );

    let html = ``;

    if (!user?.email) {
      return;
    }

    this.mailerService.sendMail({
      to: user.email,
      subject: 'Capicu -- Email Verification',
      html: html,
    });
  }

  async verify(token: string) {
    const { id, email } =
      await this.jsonWebTokenService.verifyToken<JwtEmailVerificationPayload>(
        token,
      );

    const emailVerificationId = nanoid();

    const res = await this.userModel.updateOne(
      { _id: id, email },
      { $set: { isEmailVerified: true, emailVerificationId } },
      { new: true },
    );

    if (!res.modifiedCount) {
      throw new BadRequestException('Cannot veriify email');
    }

    await this.userModel.deleteMany({ email, isEmailVerified: false });

    return { emailVerificationId };
  }

  async emailVerifyCallback(emailVerificationId: string) {
    const user = await this.userModel.findOne({ emailVerificationId });
    if (!user) {
      throw new BadRequestException('Email Not Verified');
    }
    return { message: 'Email Verified Successful' };
  }

  async sendPasswordResetCodeEmail(email: string) {
    let user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.authUtilService.checkUserBlockStatus(user);

    const otp = new OTP() as IOTP;
    const code = otp.totp(Date.now());

    user.passwordResetCode = code;

    user = await user.save();

    let html = "";

    if (!user?.email) {
      return;
    }

    let check = await this.mailerService.sendMail({
      to: user.email,
      subject: 'Capicu -- Password Reset',
      html: html,
    });

    console.log("check123----->",check)

    return { message: 'Password reset code sent' };
  }

  async sendMobileSignupCodeEmail(email: string) {
    console.log("sendMobileSignupCodeEmail")
    let user = await this.userModel.findOne({ email });

    

    const otp = new OTP() as IOTP;
    const code = otp.totp(Date.now());

    const expirationTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.mobileVerifyCode = {
      code,
      expiresAt: expirationTime,
    };

    user = await user.save();

    let html = "";

    if (!user?.email) {
      return;
    }

    this.mailerService.sendMail({
      to: user.email,
      subject: 'Capicu -- Verify your email',
      html: html,
    });

    return { message: 'Email OTP Send' };
  }

  async sendSetPasswordLinkEmail(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.authUtilService.checkUserBlockStatus(user);

    const setPasswordToken = nanoid();
    user.setPasswordToken = setPasswordToken;
    user.isEmailVerified = false;
    user.isTermsOfServiceAndPrivacyPolicyAccepted = true;

    await user.save();

    let html = "";

    if (!user?.email) {
      return;
    }

    let check = await this.mailerService.sendMail({
      to: user.email,
      subject: 'Capicu -- Set Password',
      html: `
      <div>
        <h3>Set Password Link: </h3>
        <a href="${this.configService.get<string>(
          'WEB_ORIGIN',
        )}/#/?token=${setPasswordToken}">Set Password</h4>
      </div>
    `,
    });

    console.log("check---->",check)

    return { message: 'Password set link sent' };
  }


  async sendBulkEmail(html, body){
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      const batchSize = 10;
      let users = await this.userModel.find({ is_admin: false });
      const userEmails = users.map(user => user.email);
      for (let i = 0; i < userEmails.length; i += batchSize) {
        const batchEmails = userEmails.slice(i, i + batchSize).join(',');
      
        try {
          await this.mailerService.sendMail({
            bcc: batchEmails,
            subject: `${body.subject}`,
            html: html,
          });
        } catch (error) {
          // Log the error
          console.error(`Error sending emails: ${error.message}`);
      
          // Retry the failed batch after a delay (e.g., 1 minute)
          await delay(1000);
      
          // Continue to the next batch
          continue;
        }
        await delay(1000);

      }
  }

  async sendAdminEmails(body) {
    let html = "";
    let emails = "";
    
    if(body?.all_selected){
      this.sendBulkEmail(html,body);
      return { message: 'Send Bulk Emails' };
      
    }else{
      emails = (body?.selectedEmails).join(',');
      await this.mailerService.sendMail({
        to: emails,
        subject: `${body.subject}`,
        html: html,
      });
      return { message: 'Send Emails' };
    }
    
    

    

    
  }

  
}
