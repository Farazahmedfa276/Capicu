import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JsonWebTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateToken<T extends object>(payload: T) {
    try {
      const token = await this.jwtService.signAsync(payload);
      return token;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async verifyToken<T extends object>(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<T>(token, {
        secret: 'Capicugame786',
      });
      return payload;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
