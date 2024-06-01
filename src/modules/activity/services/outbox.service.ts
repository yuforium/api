import { Injectable } from '@nestjs/common';
import { ObjectCreateDto } from 'src/common/dto/object-create/object-create.dto';
import { JwtUser } from 'src/modules/auth/auth.service';
import { ActivityService } from './activity.service';
import { ObjectService } from '../../object/object.service';
import { InjectModel } from '@nestjs/mongoose';
import { ActorDocument, ActorRecord } from '../../object/schema/actor.schema';
import { Model, Query } from 'mongoose';
import { ActivityRecord } from '../schema/activity.schema';
import { instanceToPlain } from 'class-transformer';
import { ObjectDocument, ObjectRecord } from '../../object/schema/object.schema';
import { Activity } from '@yuforium/activity-streams';

@Injectable()
export class OutboxService {
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    @InjectModel(ActorRecord.name) protected readonly actorModel: Model<ActorDocument>,
  ) { }

  public async create<T extends Activity = Activity>(dto: T) {
    return dto;
  }

  /**
   * Create a new activity from an object specified by the client
   */
  public async createObject<T extends ObjectCreateDto = ObjectCreateDto>(
    _domain: string,
    _user: JwtUser,
    outboxActorId: string,
    dto: T
  ) {
    const id = this.objectService.id();

    const lookups: Query<ActorDocument | null, ActorDocument>[] = [];
    if (Array.isArray(dto.attributedTo)) {
      dto.attributedTo.forEach(id => lookups.push(this.actorModel.findOne({ id })));
    }
    else if (typeof dto.attributedTo === 'string') {
      lookups.push(this.actorModel.findOne({ id: dto.attributedTo }));
    }
    else {
      throw new Error('attributedTo must be a string or an array of strings.');
    }

    const outboxActor = await this.actorModel.findOne({ id: outboxActorId }).select(['_id', 'id']);

    if (outboxActor === null) {
      throw new Error(`Outbox actor not found for ${outboxActorId}.`);
    }

    const recordDto: ObjectRecord = await this.objectService.assignObjectMetadata({
      ...dto,
      '@context': 'https://www.w3.org/ns/activitystreams', // note that direct assignment like dto['@context'] = '...' doesn't work
      id: `${outboxActor.id}/posts/${id.toString()}`
    });

    const obj = await this.objectService.create(recordDto);

    const activityId = this.activityService.id();

    const activityDto: ActivityRecord = {
      id: `${outboxActor.id}/activities/${activityId.toString()}`,
      type: 'Create',
      actor: Array.isArray(dto.attributedTo) ? dto.attributedTo[0] as string : dto.attributedTo as string,
      object: instanceToPlain(obj),
      _domain: _domain,
      _local: true,
      _public: recordDto._public
    };

    const activity = await this.activityService.create(activityDto);

    return activity;
  }

  /**
   * Return an object that is associated with this instance.
   * @param id
   * @returns
   */
  public async getLocalObject(id: string): Promise<ObjectDocument | null> {
    return this.objectService.findOne({ id, _serviceId: { $ne: null } });
  }
}
