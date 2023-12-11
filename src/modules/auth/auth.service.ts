import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../user/schemas/user.schema';
import { Exclude, instanceToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { PersonDto } from '../../common/dto/object/person.dto';
import { ObjectService } from '../object/object.service';
import { PersonRecordDto } from '../object/schema/person.schema';

export interface JwtUser {
  _id: string;
  username: string;
  actor: PersonDto;
}

/**
 * This should derive from a DTO and should have id and _id properties associated with it
 */
export class JwtUserActor extends PersonDto {
  id!: string;
  preferredUsername!: string;

  @Exclude()
  to!: string | string[];
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

    const actor = plainToInstance(JwtUserActor, actorRecord, {excludeExtraneousValues: true});

    console.log(Object.keys(instanceToPlain(actor)));

    const payloadActor = {...plainToClass(PersonRecordDto, actor, {excludeExtraneousValues: true}), preferredUsername: user.username} as PersonRecordDto & {_id: string, preferredUsername: string};

    const payload: JwtUser = {
      _id: user._id.toString(),
      username: user.username,
      actor: instanceToPlain(actor) as JwtUserActor
    };

    return {
      access_token: this.jwtService.sign(payload),
      expires_in: 86400
    };
  }
}
