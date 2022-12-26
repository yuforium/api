import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectService } from '../object/object.service';
import { UserService } from '../user/user.service';

@Injectable()
export class WebfingerService {
  constructor(protected userService: UserService, protected objectService: ObjectService) {}

  public async getAccount(serviceId: string, username: string): Promise<any> {
    const user = await this.userService.findOne(serviceId, username);

    if (!user) {
      throw new NotFoundException();
    }
    const person = await this.objectService.findById(user.defaultIdentity);

    if (!person) {
      throw new NotFoundException();
    }

    return {
      subject: `acct:${username}@${serviceId}`,
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
        },
      ],
    };
  }
}
