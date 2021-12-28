import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityStreams, Create } from '@yuforium/activity-streams-validator';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { ObjectService } from '../object/object.service';
import { ActivityDocument } from './schema/activity.schema';

@Injectable()
export class ActivityService {
  constructor(
    protected readonly objectService: ObjectService,
    @InjectModel('Activity') protected readonly activityModel: Model<ActivityDocument>
  ) { }

  public async get(id: string): Promise<ActivityDocument> {
    return this.activityModel.findOne({id});
  }

  public async create(serviceId, objectDto: any) {
    const obj = await this.objectService.create(objectDto);
    const activity = new Create();
    const _id = new Types.ObjectId(); // this is the internal id

    objectDto.id = obj.id;

    activity.actor = obj.attributedTo;
    activity.object = objectDto;
    activity.id = `https://${serviceId}/activity/${_id}`;

    return (await this.activityModel.create({_id, ...instanceToPlain(activity)})).toObject();
  }

  public async find(query: any): Promise<ActivityDocument[]> {
    return this.activityModel.find(query).exec();
  }
}
