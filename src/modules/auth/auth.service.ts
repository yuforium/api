import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { use } from 'passport';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(protected userService: UserService, protected jwtService: JwtService) { }

  public async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);

    if (user && user.password === password) {
      return {
        username: user.username,
        _id: user._id
      }
    }

    return undefined;
  }

  public async login(user: any) {
    console.log('the user is', user);
    const payload = {username: user.username, sub: user._id};

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
