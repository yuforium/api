import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(protected userService: UserService, protected jwtService: JwtService) { }

  public async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);

    if (user && user.password === password) {
      const {password, ...result} = user;
      return result;
    }

    return undefined;
  }

  public async login(user: any) {
    const payload = {username: user.username, sub: user.userId};

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
