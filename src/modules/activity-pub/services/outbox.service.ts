import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { ActivityRecord } from '../../activity/schema/activity.schema';
import { ActivityService } from '../../activity/services/activity.service';
import { ObjectService } from '../../object/object.service';
import { ObjectDocument, ObjectRecord } from '../../object/schema/object.schema';
import { Activity } from '@yuforium/activity-streams';
import { JwtUser } from 'src/modules/auth/auth.service';
import { Model, Query } from 'mongoose';
import { ObjectCreateDto } from 'src/common/dto/object-create/object-create.dto';
import { ActorDocument, ActorRecord } from 'src/modules/object/schema/actor.schema';
import { InjectModel } from '@nestjs/mongoose';

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
   * Create an activity from an object DTO.  This is a convenience method that creates the object and activity in one call.
   * It's assumed that the DTO has been sanitized and validated before calling this method.
   * @param domain Service domain name
   * @param user User who originated the activity (should always resolve to a person)
   * @param outboxActorId Actor ID of the outbox to which this was posted (for example, in a forum this would be the forum's id)
   * @param dto Object DTO
   * @returns 
   */
  public async createActivityFromObject<T extends ObjectCreateDto = ObjectCreateDto>(domain: string, user: JwtUser, outboxActorId: string, dto: T): Promise<Activity> {
    const id = this.objectService.id();

    const lookups: Query<ActorDocument | null, ActorDocument>[] = [];
    if (Array.isArray(dto.attributedTo)) {
      dto.attributedTo.forEach(id => lookups.push(this.actorModel.findOne({id})));
    }
    else if (typeof dto.attributedTo === 'string') {
      lookups.push(this.actorModel.findOne({id: dto.attributedTo}));
    }
    else {
      throw new Error('attributedTo must be a string or an array of strings.');
    }

    const outboxActor = await this.actorModel.findOne({id: outboxActorId}).select(['_id', 'id']);

    if (outboxActor === null) {
      throw new Error(`Outbox actor not found for ${outboxActorId}.`);
    }

    // lookups.forEach(lookup => lookup = lookup.select('_id'));

    const _attribution = (await Promise.all(lookups)).map(doc => doc?._id).filter(id => id !== null);

    const recordDto: ObjectRecord = {
      ...dto,
      '@context': 'https://www.w3.org/ns/activitystreams', // note that direct assignment like dto['@context'] = '...' doesn't work
      id: `${outboxActor.id}/posts/${id.toString()}`,
      _domain: domain,
      _outbox: outboxActor._id,
      _attribution,
      _public: Array.isArray(dto.to) ? dto.to.includes('https://www.w3.org/ns/activitystreams#Public') : dto.to === 'https://www.w3.org/ns/activitystreams#Public',
      _local: true
    };

    const obj = await this.objectService.create(recordDto);

    const activityId = this.activityService.id();

    const activityDto: ActivityRecord = {
      id: `${outboxActor.id}/activities/${activityId.toString()}`,
      type: 'Create',
      actor: Array.isArray(dto.attributedTo) ? dto.attributedTo[0] as string : dto.attributedTo as string,
      object: instanceToPlain(obj),
      _domain: domain,
      _local: true
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
    return this.objectService.findOne({id, _serviceId: {$ne: null}});
  }
}
