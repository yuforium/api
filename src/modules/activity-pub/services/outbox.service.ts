import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { ServiceId } from 'src/common/types/service-id.type';
import { ActivityDto } from 'src/modules/activity/dto/activity.dto';
import { ActivityRecordDto } from 'src/modules/activity/schema/activity.schema';
import { ActivityService } from 'src/modules/activity/services/activity.service';
import { ObjectCreateDto } from 'src/common/dto/create/object-create.dto';
import { ObjectService } from 'src/modules/object/object.service';
import { ObjectRecordDto } from 'src/modules/object/schema/object.schema';
import { Types } from 'mongoose';
import { ActivityPubService } from './activity-pub.service';
import { Actor } from '@yuforium/activity-streams';

@Injectable()
export class OutboxService {
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityPubService: ActivityPubService
  ) {}

  public async find() {

  }

  /**
   * Not to be confused with the "create" actviity, this creates an activity submitted by a user to their outbox.
   */
  public async create(serviceId: ServiceId, actor: Actor, dto: ObjectCreateDto | ActivityDto): Promise<ActivityDto> {
    let activity;
    let object;

    if (!(dto instanceof ActivityDto)) {
      [activity, object] = await (this.createFromObject(serviceId, actor, dto));
    }
    else {
      activity = new ActivityRecordDto();
    }

    await this.activityPubService.dispatch(activity);

    return activity;
  }

  protected async createFromObject(serviceId: ServiceId, actor: Actor, dto: ObjectCreateDto): Promise<[ActivityRecordDto, ObjectRecordDto]> {

    const _objectId = new Types.ObjectId();
    const _activityId = new Types.ObjectId();
    const objectDto: ObjectRecordDto = Object.assign(new ObjectRecordDto(), {
      ...dto,
      _id: _objectId.toString(),
      id: `${actor.id}/${dto.type && typeof dto.type === 'string' ? dto.type.toLowerCase() : 'object'}/${_objectId.toString()}`,
      _serviceId: serviceId,
      attributedTo: actor.id,
      _public: dto.to?.includes('https://www.w3.org/ns/activitystreams#Public') || false,
      _activityId: _activityId.toString(),
      published: new Date().toISOString(),
    });

    const object = await this.objectService.create(objectDto);

    const activityDto: ActivityRecordDto = Object.assign(new ActivityRecordDto(), {
      _id: _activityId.toString(),
      id: `${actor.id}/activity/${_activityId.toString()}`,
      type: 'Create',
      actor: actor.id,
      object: instanceToPlain(objectDto),
      _serviceId: serviceId,
      _objectId: object._id,
      published: object.published,
    });

    const activity = await this.activityService.create(activityDto);

    return [activity, object];
  }
}
