import { Injectable } from '@nestjs/common';
import { ActivityService } from 'src/modules/activity/services/activity.service';
import { ObjectService } from 'src/modules/object/object.service';
import { ActivityPubService } from './activity-pub.service';
import { Activity, Actor, ASObject, ASObjectOrLink } from '@yuforium/activity-streams';
import { ObjectCreateDto } from 'src/common/dto/object-create/object-create.dto';
import { OutboxProcessorService } from './outbox-processor.service';

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

@Injectable()
export class OutboxService {
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityPubService: ActivityPubService,
    protected readonly outboxProcessor: OutboxProcessorService
  ) {}

  public async find() {

  }

  public async create<T extends APActivity = APActivity>(dto: T) {
    const activity = await this.outboxProcessor.create(dto);

    // await this.activityPubService.dispatch(activity);
  }

  // the signature for this should be createObject(actor: Actor, dto: ASObject) - what to do with serviceId? It can be appended to the dto since that's a type
  /**
   * Create a new Object, and dispatches it to the appropriate recipients
   * @param actor Actor who created the object
   * @param dto Object to be created
   * @returns
   */
  async createActivityFromObject<T extends APObject = APObject>(actorId: string, dto: T): Promise<any> {
    dto = Object.assign({}, dto);

    const activity = await this.outboxProcessor.createActivityFromObject<T>(dto);

    return activity;

    // const object = await this.objectService.create(dto);
    // const {activity} = await this.activityService.create('Create', actorId, object);

    // // await this.activityPubService.dispatch(activity);

    // return {activity, object};
  }
}
