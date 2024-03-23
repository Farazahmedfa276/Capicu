import {
  ExecutionContext,
  ForbiddenException,
  Headers,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const ip = req.connection.remoteAddress;
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, @Headers() headers: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    let { authorization } = headers.getRequest().headers;
    authorization = authorization.replace('Bearer ', '');

    if (authorization !== user.accessToken) {
      throw new ForbiddenException({
        message: 'You have been logged out, please login again.',
      });
    }
    if (user.status === false) {
      throw new ForbiddenException({ message: "This user is blocked!" })
    }
    // console.log(user, "USER")
    // console.log(authorization, 'AUTHORIZATION')
    // console.log(user.accessToken, 'ACCESS TOKEN')
    if (!user.isEmailVerified) {
      throw new ForbiddenException({
        name: 'EMAIL_VERIFICATION',
        message: 'Email Not Verified!',
      });
    }

    return user;
  }
}
