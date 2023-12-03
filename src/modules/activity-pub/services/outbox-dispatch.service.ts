import { Inject, Injectable, Logger, NotImplementedException, Scope } from '@nestjs/common';
import { ActivityService } from '../../activity/services/activity.service';
import { ObjectService } from '../../object/object.service';
import { ActivityPubService } from './activity-pub.service';
import { Activity, Actor, ASObject, ASObjectOrLink } from '@yuforium/activity-streams';
import { OutboxService } from './outbox.service';
import { sign } from '@yuforium/http-signature';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PersonDto } from '../../../common/dto/object/person.dto';
import { UserService } from '../../user/user.service';
import * as crypto from 'crypto';
import { UserActor, UserPayload } from 'src/modules/auth/auth.service';

export interface APObject extends ASObject {
  [k: string]: any;
}

export interface APActivity extends Activity {
  id: string;
  type: string;
  actor: string;
  object: ASObjectOrLink;
  [k: string]: any;
}

export interface APActor extends Actor {
  id: string;
  inbox: string;
  [k: string]: any;
}

export interface APOutboxProcessor {
  create(activity: APActivity): Promise<APActivity>;
  createObject(object: APObject, actor: APActor): Promise<APObject>;
}

export interface APService {
  toPlain(object: APObject): APObject;
}

export interface APActivityService {
  create(dto: APActivity): Promise<APActivity>;
}

export interface APObjectService {
  create(actorId: string, dto: APObject): Promise<{object: APObject}>;
}

@Injectable({scope: Scope.REQUEST})
export class OutboxDispatchService {
  protected logger = new Logger(OutboxDispatchService.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityPubService: ActivityPubService,
    protected readonly processor: OutboxService,
    protected readonly userService: UserService,
    @Inject(REQUEST) protected readonly request: Request
  ) {}

  public async create<T extends APActivity = APActivity>(dto: T) {
    const activity = await this.processor.create(dto);

    // await this.activityPubService.dispatch(activity);
  }

  // the signature for this should be createObject(actor: Actor, dto: ASObject) - what to do with serviceId? It can be appended to the dto since that's a type
  /**
   * Create a new Object, and dispatches it to the appropriate recipients
   * @param actor Actor who created the object
   * @param dto Object to be created
   * @returns
   */
  async createActivityFromObject<T extends APObject = APObject>(serviceDomain: string, actor: UserActor, dto: T): Promise<any> {
    dto = Object.assign({}, dto);

    const activity = await this.processor.createActivityFromObject<T>(serviceDomain, actor, dto);

    // const object = await this.objectService.create(dto);
    // const {activity} = await this.activityService.create('Create', actorId, object);

    await this.dispatch(activity);

    // return {activity, object};

    return activity;
  }

  // @todo handle cc/bcc fields as well
  /**
   * Extract dispatch targets from an activity.  These targets still need to be resolved (i.e. if the target is a collection like a followers collection).
   * @param activity 
   * @returns 
   */
  protected async getDispatchTargets(activity: APActivity): Promise<string[]> {
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

  protected async dispatch(activity: APActivity) {
    let dispatchTo = await this.getDispatchTargets(activity);
    
    dispatchTo.forEach(async to => {
      const response = await this.send(to, activity);
      return response;
    });
  }

  protected async getInboxUrl(address: string): Promise<string> {
    // this.logger.debug(`getInboxUrl(): Getting inbox url for ${address}`);

    const actor = (await fetch(address, {headers: {'Accept': 'application/activity+json'}}).then(res => res.json()));

    return (actor as any).inbox;
  }

  /**
   * @todo for a production system, this would need to resolved targets (i.e. if the target was a followers collection).  this would/should be done with queueing.
   * @param url 
   * @param activity 
   * @returns 
   */
  protected async send(url: string, activity: APActivity): Promise<any> {
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
          'signature': `keyId="http://yuforium.dev/user/chris#main-key",headers="${opts.headers?.join(" ")}",signature="${opts.signature}"`,
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
