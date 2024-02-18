import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/user.schema';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthUtilService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async hashPassword(unHashedPassword: string) {
    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(unHashedPassword, salt, 32)) as Buffer;
    const hashedPassword = `${salt}.${hash.toString('hex')}`;
    return hashedPassword;
  }

  async checkPassword(storedPassword,unHashedPassword){


    console.log('storedPassword-->',storedPassword);
    const salt = storedPassword.split('.')[0];

    const hash = (await scrypt(unHashedPassword, salt, 32)) as Buffer;
    const hashedPassword = `${salt}.${hash.toString('hex')}`;

    if(storedPassword !== hashedPassword){
      return false;
    }
    return true;

  }

  async checkUserBlockStatus(user: UserDocument) {

    await this.checkUserStatus(user);

    const current_date = new Date();

    const added_time_to_current_date = new Date();

    added_time_to_current_date.setMinutes(current_date.getMinutes() + 2);


    await this.userModel.updateOne(
      { _id: user.id },
      {
        emailTimer:
          current_date.getTime() < user.emailTimer
            ? user.emailTimer
            : added_time_to_current_date,
        emailTimerCount:
          current_date.getTime() < user.emailTimer
            ? user.emailTimerCount + 1
            : 0,
      },
    );
  }

  async checkUserStatus(user: UserDocument){

    const current_date = new Date();

    const added_time_to_current_date = new Date();

    added_time_to_current_date.setMinutes(current_date.getMinutes() + 2);

    if (current_date.getTime() < user.emailTimer && user.emailTimerCount >= 5) {
      throw new ForbiddenException('Your account has been blocked');
    }
    
  }
}
