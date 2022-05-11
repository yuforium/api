import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { UserDocument } from '../user/schemas/user.schema';
import { plainToClass } from 'class-transformer';
import { PersonDto } from '../user/dto/person.dto';
import { ObjectService } from '../object/object.service';

@Injectable()
export class AuthService {
  protected readonly logger = new Logger(AuthService.name);
  constructor(
    protected userService: UserService,
    protected jwtService: JwtService,
    protected objectService: ObjectService
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
      actor: plainToClass(PersonDto, await this.objectService.findById(user.defaultIdentity))
    };

    return {
      access_token: this.jwtService.sign(payload),
      expires_in: 86400
    };
  }
}
