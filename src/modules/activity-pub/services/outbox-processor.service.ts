import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ObjectDto } from 'src/common/dto/object';
import { ObjectCreateDto } from 'src/common/dto/object-create/object-create.dto';
import { ActivityRecordDto } from 'src/modules/activity/schema/activity.schema';
import { ActivityService } from 'src/modules/activity/services/activity.service';
import { ObjectService } from 'src/modules/object/object.service';
import { ObjectDocument, ObjectRecordDto } from 'src/modules/object/schema/object.schema';
import { APActivity, APObject } from './outbox.service';

@Injectable()
export class OutboxProcessorService {
  constructor(
    protected readonly activityService: ActivityService, 
    protected readonly objectService: ObjectService
  ) { }

  public async create<T extends APActivity = APActivity>(dto: T) {
    return dto;
  }

  public async createActivityFromObject<T extends APObject = APObject>(dto: T): Promise<APActivity> {
    const id = this.objectService.id();
    const idType = typeof dto.type === 'string' && dto.type ? (dto.type as string).toLowerCase() : 'object';
    const actor = await this.objectService.findOne({
      id: dto.attributedTo,
      _serviceId: {$ne: null}
    });

    if (!actor) {
      throw new Error('Actor does not exist');
    }
    const recordDto: ObjectRecordDto = {
      ...dto as ObjectDto,
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `https://${actor.id}/posts/${id.toString()}`,
      _hostname: actor._hostname,
      _path: `${actor._path}/${actor._pathId}/posts/${id.toString()}`,
      _pathId: id.toString(),
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
      actor: `${dto.attributedTo}`,
      object: instanceToPlain(obj),
      _hostname: actor._hostname,
      _path: `${actor._path}/${actor._pathId}/activities`,
      _pathId: activityId.toString(),
      _local: true
    }

    const activity = await this.activityService.create(activityDto)

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
