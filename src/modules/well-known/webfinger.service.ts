import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from '../activity-pub/schema/person.schema';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class WebfingerService {
  constructor(@InjectModel(Person.name) protected personModel: Model<PersonDocument>) {}

  public async getAccount(serviceId: string, username: string): Promise<any> {
    const user = await this.personModel.findOne({id: `https://${serviceId}/user/${username}`});

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
