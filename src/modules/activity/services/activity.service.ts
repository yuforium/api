import { Injectable, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Create } from '@yuforium/activity-streams-validator';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { Model, Types } from 'mongoose';
// import { ObjectService } from '../object/object.service';
import { ActivityDocument } from '../schema/activity.schema';
import { SyncStreamService } from './sync-stream.service';

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel('Activity') protected readonly activityModel: Model<ActivityDocument>,
    public readonly processor: SyncStreamService
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

    await this.processor.dispatch(activity);

    return (await this.activityModel.create({_id, ...instanceToPlain(activity)})).toObject();
  }

  public async process(activity: any) {
    if (activity.type === 'Create') {
      return Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 16); // @todo use a real, traceable id
    }

    console.log('shouldnt exception be thrown')

    throw new NotImplementedException(`${activity.type} is not supported at this time.`);
  }

  public async find(query: any): Promise<ActivityDocument[]> {
    return this.activityModel.find(query).exec();
  }

  public async count(query: any): Promise<number> {
    return this.activityModel.count(query).exec();
  }
}
