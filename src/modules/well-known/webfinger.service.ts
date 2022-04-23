import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectService } from '../object/object.service';

@Injectable()
export class WebfingerService {
  constructor(protected objectService: ObjectService) {}

  public async getAccount(serviceId: string, username: string): Promise<any> {
    const user = await this.objectService.findOne({id: `https://${serviceId}/user/${username}`});

    if (!user) {
      throw new NotFoundException();
    }

    return {
      subject: `acct:${username}@${serviceId}`,
      aliases: [`https://${serviceId}/user/${username}`],
      links: [
        {
          rel: 'self',
          type: 'application/activity+json',
          href: `https://${serviceId}/user/${username}`,
        },
        {
          rel: 'http://webfinger.net/rel/profile-page',
          type: 'text/html',
          href: `https://${serviceId}/user/${username}`,
        },
      ],
    };
  }
}
