import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../user/schemas/user.schema';
import { plainToClass } from 'class-transformer';
import { PersonDto } from '../../common/dto/object/person.dto';
import { ObjectService } from '../object/object.service';
import { Actor } from '@yuforium/activity-streams';
import { Schema, Types } from 'mongoose';
import { PersonDocument, PersonRecordDto } from '../object/schema/person.schema';

export interface UserPayload {
  _id: string;
  username: string;
  actor: UserActor;
}

/**
 * This should derive from a DTO and should have id and _id properties associated with it
 */
export interface UserActor extends Actor {
  _id: string | Schema.Types.ObjectId;
  id: string;
  preferredUsername: string;
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

    const actor = await this.userService.findPersonById(user.defaultIdentity);

    if (actor === null) {
      throw new Error('User\'s default identity not found');
    }

    const payload: UserPayload = {
      _id: user._id.toString(),
      username: user.username,
      actor: {...plainToClass(PersonRecordDto, actor as PersonDto), preferredUsername: user.username} as PersonRecordDto & {_id: string, preferredUsername: string}
    };

    return {
      access_token: this.jwtService.sign(payload),
      expires_in: 86400
    };
  }
}
