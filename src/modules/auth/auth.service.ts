import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(protected userService: UserService, protected jwtService: JwtService) { }

  public async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);

    if (user && await bcrypt.compare(user.password, password)) {
      return {
        username: user.username
      }
    }

    return undefined;
  }

  public async login(user: any) {
    const payload = {username: user.username, sub: user._id};

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
