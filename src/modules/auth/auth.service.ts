import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../user/schemas/user.schema';
import { ActivityPubService } from '../activity-pub/activity-pub.service';
import { Model } from 'mongoose';
import { Person, PersonDocument } from '../activity-pub/schema/person.schema';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { PersonDto } from '../user/dto/person.dto';

@Injectable()
export class AuthService {
  protected readonly logger = new Logger(AuthService.name);
  constructor(
    protected userService: UserService,
    protected jwtService: JwtService,
    protected activityPubService: ActivityPubService,
    @InjectModel(Person.name) protected readonly personModel: Model<PersonDocument>
  ) { }

  public async validateUser(serviceId, username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(serviceId, username);

    this.logger.debug(`Validating user "${username}@${serviceId}"`);

    if (user) {
      this.logger.verbose(`User "${username}@${serviceId}" found`);

      if (await await bcrypt.compare(password, user.password)) {
        this.logger.debug(`User "${username}@${serviceId}" password matches, validation succeeded`);
        return user;
      }

      this.logger.debug(`User "${username}@${serviceId}" password does not match, validation failed`);
    }
    else {
      this.logger.debug(`User "${username}@${serviceId}" not found, validation failed`);
    }

    return undefined;
  }

  public async login(user: UserDocument) {
    const payload = {
      username: user.username,
      _id: user._id.toString(),
      actor: plainToClass(PersonDto, await this.personModel.findById(user.defaultIdentity))
    };

    return {
      access_token: this.jwtService.sign(payload)
    };
  }
}
