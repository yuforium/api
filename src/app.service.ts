import { Injectable } from '@nestjs/common';
import * as psl from 'psl';

@Injectable()
export class AppService {
  public async get(domain) {
    const id = `https://${domain}`;

    return {
      type: 'Application',
      id,
      inbox:     `${id}/inbox`,
      outbox:    `${id}/outbox`,
      following: `${id}/following`,
      followers: `${id}/followers`,
      liked:     `${id}/liked`,
      sharedInbox: `${id}/sharedInbox`,

      streams: [
        `${id}/top/forums`,
        `${id}/top/users`,
        `${id}/trending/forums`,
        `${id}/trending/users`
      ]
    };
  }

  public async createDomain(domain) {
    
  }

  public async getDomain(hostname) {
    const domain = psl.get(hostname) || psl.get(process.env.DEFAULT_DOMAIN);

    if (typeof domain !== 'string') {
      throw new Error('not a valid name');
    }

    return domain;
  }

  /**
   * Send a follow request to another domain
   * @param domain Domain to follow
   */
  public async follow(domain) {

  }
}
