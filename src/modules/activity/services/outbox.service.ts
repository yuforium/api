import { Injectable } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ObjectService } from '../../object/object.service';
import { InjectModel } from '@nestjs/mongoose';
import { ActorDocument, ActorRecord } from '../../object/schema/actor.schema';
import { Model, Query } from 'mongoose';
import { ActivityRecord } from '../schema/activity.schema';
import { instanceToPlain } from 'class-transformer';
import { ObjectRecord } from '../../object/schema/object.schema';
import { Activity } from '@yuforium/activity-streams';
import { JwtUser } from '../../auth/auth.service';
import { ObjectType } from '../../object/type/object.type';
import { BaseObjectType } from '../../object/type/base-object.type';

export type OutboxObjectCreateType = Omit<ObjectType, 'id'> & {
  published: string;
}

@Injectable()
export class OutboxService {
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    @InjectModel(ObjectRecord.name) protected readonly objectModel: Model<ObjectRecord>,
    @InjectModel(ActorRecord.name) protected readonly actorModel: Model<ActorDocument>,
  ) { }

  public async create<T extends Activity = Activity>(dto: T) {
    return dto;
  }

  /**
   * Create a new activity from an object specified by the client
   */
  public async createObject<T extends OutboxObjectCreateType = OutboxObjectCreateType>(
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

    const outboxActor = await this.objectModel.findOne({ id: outboxActorId });

    if (outboxActor === null) {
      throw new Error(`Outbox actor not found for ${outboxActorId}.`);
    }

    const recordDto: ObjectType = await this.objectService.assignObjectMetadata({
      ...dto,
      '@context': 'https://www.w3.org/ns/activitystreams', // note that direct assignment like dto['@context'] = '...' doesn't work
      id: `${outboxActor.id}/posts/${id.toString()}`
    });

    const session = await this.objectModel.db.startSession();
    session.startTransaction();

    try {
      const obj = Array.isArray(recordDto.type)
        ? recordDto.type.some(type => ['Note', 'Article'].includes(type))
          ? await this.objectService.createContent(recordDto)
          : await this.objectService.create(recordDto)
        : ['Note', 'Article'].includes(recordDto.type)
          ? await this.objectService.createContent(recordDto)
          : await this.objectService.create(recordDto);

      const activityId = this.activityService.id();

      const activityDto: ActivityRecord = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${outboxActor.id}/activities/${activityId.toString()}`,
        type: 'Create',
        actor: Array.isArray(dto.attributedTo) ? dto.attributedTo[0] as string : dto.attributedTo as string,
        object: instanceToPlain(obj),
        _domain: _domain,
        _local: true,
        _public: true,
        _raw: ''
      };

      activityDto._raw = JSON.stringify(instanceToPlain(activityDto));

      const activity = await this.activityService.create(activityDto);

      return activity;
    }
    catch (e) {

    }
  }

  /**
   * Return an object that is associated with this instance.
   * @param id
   * @returns
   */
  public async getLocalObject(id: string): Promise<BaseObjectType | null> {
    return this.objectService.findOne({ id, _serviceId: { $ne: null } });
  }
}
