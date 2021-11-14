import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../user/schemas/user.schema';
import { ActivityPubService } from '../activity-pub/activity-pub.service';
import { PersonDocument } from '../activity-pub/schema/person.schema';

@Injectable()
export class AuthService {
  protected readonly logger = new Logger(AuthService.name);
  constructor(
    protected userService: UserService,
    protected jwtService: JwtService,
    protected activityPubService: ActivityPubService
  ) { }

  public async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);

    this.logger.debug(`Validating user "${username}"`);

    if (user) {
      this.logger.verbose(`User "${username}" found`);

      if (await await bcrypt.compare(password, user.password)) {
        this.logger.debug(`User "${username}" password matches, validation succeeded`);



        // @todo find the actual user document and send back from here
        return user;
        return {
          username: user.username,
          defaultIdentity: user.defaultIdentity
        }
      }

      this.logger.debug(`User "${username}" password does not match, validation failed`);
    }
    else {
      this.logger.debug(`User "${username}" not found, validation failed`);
    }

    return undefined;
  }

  public async login(user: UserDocument) {
    console.log("User Doc", user);
    if (!user) {
      throw new UnauthorizedException();
    }
    // const person = await this.activityPubService.findOne({_id: user.defaultIdentity}) as PersonDocument;

    const payload = {
      // sub: person.id,
      // name: person.name,
      username: user.username,
      iam: "chris"
    };

    console.log("the payload is", payload);
    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
