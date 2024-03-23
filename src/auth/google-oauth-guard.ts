import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  handleRequest(err: any, user: any, info: any) {
    if (err) {
      return err;
    }
    return user;
  }
}
