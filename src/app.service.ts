import { Injectable } from '@nestjs/common';
import { resolveDomain } from './common/decorators/service-domain.decorator';

@Injectable()
export class AppService {
  public async get(domain: string) {
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

  public async getDomain(hostname: string) {
    return resolveDomain(hostname);
  }

  public async getHealthCheck() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now()
    };
  }
}
