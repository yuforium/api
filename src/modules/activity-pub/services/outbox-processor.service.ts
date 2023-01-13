import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
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
    const idType = typeof dto === 'string' && dto ? (dto as string).toLowerCase() : 'object';
    const actor = await this.objectService.findOne({
      id: dto.attributedTo,
      _serviceId: {$ne: null}
    });

    if (!actor) {
      throw new Error('Actor does not exist');
    }
    
    Object.assign(dto, {
      id: `${actor.id}/${idType}/${id.toString()}`,
      '@context': 'https://www.w3.org/ns/activitystreams',
      _serviceId: actor._serviceId,
      _public: Array.isArray(dto.to) ? dto.to.includes('https://www.w3.org/ns/activitystreams#Public') : dto.to === 'https://www.w3.org/ns/activitystreams#Public'
    });

    // first line fails, second line works, note that Object.assign works above
    // dto['@context'] = 'https://www.w3.org/ns/activitystreams';
    // dto['context'] = 'wtf';

    const obj = await this.objectService.create(dto as ObjectRecordDto);

    const activityId = this.activityService.id();

    const activityDto: ActivityRecordDto = {
      id: `${dto.attributedTo}/create/${activityId.toString()}`,
      type: 'Create',
      actor: `${dto.attributedTo}`,
      object: instanceToPlain(obj)
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
