import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityStreams, Create } from '@yuforium/activity-streams-validator';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { Model, Types } from 'mongoose';
// import { ObjectService } from '../object/object.service';
import { ActivityDocument } from './schema/activity.schema';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel('Activity') protected readonly activityModel: Model<ActivityDocument>
  ) { }

  public async get(id: string): Promise<ActivityDocument> {
    return this.activityModel.findOne({id});
  }

  public async create(idPrefix: string, objectDto: any): Promise<any> {
    const activity = new Create();
    const _id = new Types.ObjectId(); // this is the internal id

    activity.actor = objectDto.attributedTo;
    activity.object = objectDto;
    activity.id = `${idPrefix}/activity/${_id}`;

    console.log('instance to plain', objectDto);
    return (await this.activityModel.create({_id, ...instanceToPlain(activity)})).toObject();
  }

  public async find(query: any): Promise<ActivityDocument[]> {
    return this.activityModel.find(query).exec();
  }
}
