import { Injectable } from '@nestjs/common';
import { ActivityService } from 'src/modules/activity/services/activity.service';
import { ObjectService } from 'src/modules/object/object.service';
import { ActivityPubService } from './activity-pub.service';
import { Activity, Actor, ASObject } from '@yuforium/activity-streams';

export interface APObject extends ASObject {
  [k: string]: any;
}

export interface APActivity extends Activity {
  [k: string]: any;
}

export interface APActor extends Actor {
  id: string;
  [k: string]: any;
}

export interface APService {
  toPlain(object: APObject): APObject;
}

export interface APActivityService {
  create(type: 'Create', actorId: string, object: APObject): Promise<{activity: APActivity}>;
}

export interface APObjectService {
  create(actorId: string, dto: APObject): Promise<{object: APObject}>;
}

@Injectable()
export class OutboxService {
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityPubService: ActivityPubService
  ) {}

  public async find() {

  }

  // the signature for this should be createObject(actor: Actor, dto: ASObject) - what to do with serviceId? It can be appended to the dto since that's a type
  /**
   * Create a new Object, and dispatches it to the appropriate recipients
   * @param actor Actor who created the object
   * @param dto Object to be created
   * @returns
   */
  async createObject<T extends APObject = APObject>(actorId: string, dto: T): Promise<{activity: APActivity, object: APObject}> {
    const {object} = await this.objectService.create(actorId, dto);
    const {activity} = await this.activityService.create('Create', actorId, object);

    await this.activityPubService.dispatch(activity);

    return {activity, object};
  }
}
