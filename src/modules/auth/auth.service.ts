import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../user/schemas/user.schema';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { PersonDto } from '../../common/dto/object/person.dto';
import { ObjectService } from '../object/object.service';
import { UserActorDto } from '../user/dto/user-actor.dto';

export interface JwtUser {
  _id: string;
  actor: PersonDto;
}

@Injectable()
export class AuthService {
  protected readonly logger = new Logger(AuthService.name);
  constructor(
    protected userService: UserService,
    protected jwtService: JwtService,
    protected objectService: ObjectService
  ) { }

  public async validateUser(serviceId: string, username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(serviceId, username);

    this.logger.debug(`Validating user "${username}@${serviceId}"`);

    if (user) {
      this.logger.verbose(`User "${username}@${serviceId}" found`);

      if (user.password === undefined) {
        throw new UnauthorizedException();
      }

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
    if (user.defaultIdentity === undefined) {
      throw new Error('User has no default identity');
    }

    if (user.username === undefined) {
      throw new Error('User has no assigned username');
    }

    const actorRecord = await this.userService.findPersonById(user.defaultIdentity);

    if (actorRecord === null) {
      throw new Error('User\'s default identity not found');
    }

    const actor = plainToInstance(UserActorDto, actorRecord, {excludeExtraneousValues: true});
    actor.preferredUsername = user.username;

    const payload: JwtUser = {
      _id: user._id.toString(),
      actor: instanceToPlain(actor) as UserActorDto
    };

    return {
      access_token: this.jwtService.sign(payload),
      expires_in: 86400
    };
  }
}
