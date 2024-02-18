import { CanActivate, ExecutionContext, Get, Injectable, Ip, Req } from '@nestjs/common';
import { Request } from 'express';
import * as _ip from 'ipaddr.js';
import { AuthController } from '../auth/auth.controller'
@Injectable()
export class NakamaGuard implements CanActivate {
  static getAuthGuardIPAddress: any;
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    console.log('=====> ip',request.hostname,'=====> ip')

    const ipAddress: string = request.connection.remoteAddress;
    console.log(ipAddress)

    if(this.getAuthGuardIPAddress(request)){
      console.log(ipAddress)
      return true; // or false depending on the result of your authentication logic
    }
    return false
    // Your authentication logic here
  }

  getAuthGuardIPAddress(@Req() request: Request) {
    const ipAddress = request.ip;
    return true;
    // return `The incoming request IP address is: ${ipAddress}`;
  }
}

// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import * as _ip from 'ipaddr.js';

// @Injectable()
// export class IpAddressAuthGuard implements CanActivate {
//   private readonly allowedIps = ['127.0.0.1', '192.168.1.1']; // Replace with your whitelist of allowed IP addresses

//   canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const ip = request.ip;
//     console.log(ip)
//     // Check if the IP address is in the whitelist
//     // const isAllowed = this.allowedIps.includes(ip);

//     // if (!isAllowed) {
//     if (!ip) {

//       throw new Error('IP address not allowed');
//     }
//     return ip
//     // return isAllowed;
//   }
// }
