import { Inject, Injectable, Logger, NotImplementedException, Scope } from '@nestjs/common';
import { ActivityService } from '../../activity/services/activity.service';
import { ObjectService } from '../../object/object.service';
import { ActivityPubService } from './activity-pub.service';
import { Activity, ASObject } from '@yuforium/activity-streams';
import { sign } from '@yuforium/http-signature';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PersonDto } from '../../object/dto/object/person.dto';
import { UserService } from '../../user/user.service';
import * as crypto from 'crypto';
import { OutboxService } from '../../activity/services/outbox.service';

/**
 * A synchronous dispatch service with no queueing.  This is used for testing and development purposes only.
 */
@Injectable({scope: Scope.REQUEST})
export class SyncDispatchService {
  protected logger = new Logger(SyncDispatchService.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityPubService: ActivityPubService,
    protected readonly processor: OutboxService,
    protected readonly userService: UserService,
    @Inject(REQUEST) protected readonly request: Request
  ) { }

  /**
   * Extract dispatch targets from an activity.  These targets still need to be resolved (i.e. if the target is a collection like a followers collection).
   * @todo handle cc/bcc fields as well
   * @param activity
   * @returns
   */
  protected async getDispatchTargets(activity: Activity): Promise<string[]> {
    let to = [];

    if (typeof activity.object !== 'object' || activity.object.type === 'Link') {
      throw new NotImplementedException('link resolution is not supported');
    }

    const obj = activity.object as ASObject;

    if (Array.isArray(obj.to)) {
      to.push(...obj.to);
    }
    else if (typeof obj.to === 'string' && obj.to) {
      to.push(obj.to);
    }

    const filterPredicate = async (id: any) => {
      if (id === 'https://www.w3.org/ns/activitystreams#Public') {
        return false;
      }

      // don't bother with local users
      if (await this.processor.getLocalObject(id.toString())) {
        return false;
      }

      return true;
    };

    const filterVals = await Promise.all(to.map(val => filterPredicate(val)));

    to = to.filter((v, i) => filterVals[i]).map(v => v.toString());
    to = await Promise.all(to.map(v => this.getInboxUrl(v)));

    return to;
  }

  /**
   * Dispatch an activity to its targets.
   * @param activity
   */
  protected async dispatch(activity: Activity) {
    const dispatchTo = await this.getDispatchTargets(activity);

    dispatchTo.forEach(async to => {
      const response = await this.send(to, activity);
      return response;
    });
  }

  protected async getInboxUrl(address: string): Promise<string> {
    const actor = await fetch(address, {headers: {'Accept': 'application/activity+json'}}).then(res => res.json());
    return actor.inbox;
  }

  /**
   * @todo for a production system, this would need to resolve targets (i.e. if the target was a followers collection).  this would/should be done with queueing.
   * @param url
   * @param activity
   * @returns
   */
  protected async send(url: string, activity: Activity): Promise<any> {
    const parsedUrl = new URL(url);

    const actor = (this.request.user as any)?.actor as PersonDto;
    const username = (this.request.user as any)?.username as string;
    const user = await this.userService.findOne('yuforium.dev', username);
    const now = new Date();
    const created = Math.floor(now.getTime() / 1000);
    const privateKey = crypto.createPrivateKey({key: user?.privateKey as string, passphrase: ''});
    const body = JSON.stringify(activity);
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(body);
    // const digest = signer.sign(privateKey, 'hex');
    const digest = 'SHA-256=' + crypto.createHash('sha256').update(body).digest('base64');

    const opts = sign({
      requestPath: parsedUrl.pathname,
      method: 'post',
      keyId: actor.publicKey?.id as string,
      algorithm: 'rsa-sha256',
      privateKey,
      created,
      expires: created + 300,
      headers: ['(request-target)', 'host', 'date', 'digest'],
      headerValues: {
        host: parsedUrl.host,
        date: now.toUTCString(),
        digest
      }
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/activity+json',
          'accept': 'application/activity+json',
          'digest': digest,
          'signature': `keyId="http://yuforium.dev/user/chris#main-key",headers="${opts.headers?.join(' ')}",signature="${opts.signature}"`,
          'date': now.toUTCString()
        },
        body: JSON.stringify(activity),
      });
      if (response.ok) {
        this.logger.log(`send(): ${response.status} code received sending ${activity.id} to ${url}`);
      }
      else {
        this.logger.error(`send(): ${response.status} code received sending ${activity.id} to ${url} with response "${await response.text()}"`);
      }
      return response;
    }
    catch (err) {
      this.logger.error(`send(): failed delivery to ${url}`);
      throw err;
    }
  }
}
