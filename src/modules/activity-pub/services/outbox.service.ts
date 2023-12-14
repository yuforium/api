import { Injectable } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { ObjectDto } from '../../../common/dto/object';
import { ActivityRecordDto } from '../../activity/schema/activity.schema';
import { ActivityService } from '../../activity/services/activity.service';
import { ObjectService } from '../../object/object.service';
import { ObjectDocument, ObjectRecordDto } from '../../object/schema/object.schema';
import { ASObject, Activity } from '@yuforium/activity-streams';
import { JwtUser } from 'src/modules/auth/auth.service';
import { Mongoose, Types, Schema } from 'mongoose';
import { ObjectCreateDto } from 'src/common/dto/object-create/object-create.dto';

@Injectable()
export class OutboxService {
  constructor(
    protected readonly activityService: ActivityService, 
    protected readonly objectService: ObjectService
  ) { }

  public async create<T extends Activity = Activity>(dto: T) {
    return dto;
  }

  public async createActivityFromObject<T extends ObjectCreateDto = ObjectCreateDto>(domain: string, user: JwtUser, dto: T): Promise<Activity> {
    const id = this.objectService.id();
    const idType = typeof dto.type === 'string' && dto.type ? (dto.type as string).toLowerCase() : 'object';

    const recordDto: ObjectRecordDto = {
      ...dto,
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${user.actor.id}/posts/${id.toString()}`,
      _domain: domain,
      _outbox: new Types.ObjectId(user._id.toString()),
      _public: Array.isArray(dto.to) ? dto.to.includes('https://www.w3.org/ns/activitystreams#Public') : dto.to === 'https://www.w3.org/ns/activitystreams#Public',
      _local: true
    };

    // first line fails, second line works, note that Object.assign works above
    // dto['@context'] = 'https://www.w3.org/ns/activitystreams';
    // dto['context'] = 'wtf';

    const obj = await this.objectService.create(recordDto);

    const activityId = this.activityService.id();

    const activityDto: ActivityRecordDto = {
      id: `${dto.attributedTo}/activities/${activityId.toString()}`,
      type: 'Create',
      actor: Array.isArray(dto.attributedTo) ? dto.attributedTo[0] as string : dto.attributedTo as string,
      object: instanceToPlain(obj),
      _domain: domain,
      // _path: `${actor._path}/${actor._pathId}/activities`,
      // _pathId: activityId.toString(),
      _local: true
    }

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
