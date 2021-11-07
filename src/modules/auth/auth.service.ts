import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../user/schemas/user.schema';
import { ActivityPubService } from '../activity-pub/activity-pub.service';
import { PersonDocument } from '../activity-pub/schema/person.schema';

@Injectable()
export class AuthService {
  constructor(
    protected userService: UserService,
    protected jwtService: JwtService,
    protected activityPubService: ActivityPubService
  ) { }

  public async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);

    if (user && await bcrypt.compare(password, user.password)) {
      return {
        username: user.username,
        defaultIdentity: user.defaultIdentity
      }
    }

    return undefined;
  }

  public async login(user: UserDocument) {
    // const person = await this.activityPubService.findOne({_id: user.defaultIdentity}) as PersonDocument;

    const payload = {
      // sub: person.id,
      // name: person.name,
      username: user.username
    };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
