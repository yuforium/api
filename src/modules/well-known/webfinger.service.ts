import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectService } from '../object/object.service';
import { UserService } from '../user/user.service';
import { WebfingerDto } from './dto/webfinger.dto';

@Injectable()
export class WebfingerService {
  constructor(protected userService: UserService, protected objectService: ObjectService) {}

  public async getAccount(domain: string, username: string): Promise<WebfingerDto> {
    const user = await this.userService.findOne(domain, username);

    if (!user) {
      throw new NotFoundException();
    }
    const person = await this.objectService.findById(user.defaultIdentity);

    if (!person) {
      throw new NotFoundException();
    }

    return {
      subject: `acct:${username}@${domain}`,
      aliases: [person.id],
      links: [
        {
          rel: 'self',
          type: 'application/activity+json',
          href: person.id,
        },
        {
          rel: 'http://webfinger.net/rel/profile-page',
          type: 'text/html',
          href: person.id,
        }
      ],
    };
  }
}
