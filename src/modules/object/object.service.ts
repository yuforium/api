import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectDocument } from './schema/object.schema';
import * as mongoose from 'mongoose';
import { ActivityService } from '../activity/activity.service';
import { ActivityDocument } from '../activity/schema/activity.schema';

@Injectable()
export class ObjectService {
  constructor(
    @InjectModel('Object') protected objectModel: Model<ObjectDocument>,
    protected activityService: ActivityService
  ) { }

  public async get(id: string): Promise<ObjectDocument> {
    return this.objectModel.findOne({id});
  }

  public async create(serviceId: string, data: any): Promise<ActivityDocument> {
    const _id = new mongoose.Types.ObjectId();
    data.id = `https://${serviceId}/object/${_id}`;

    console.log('data is', data);

    const object = await this.objectModel.create({...data, _id});
    const activity = await this.activityService.create(serviceId, data);

    return activity;
  }

  public async getUserOutbox(userId: string): Promise<any> {
    return this.objectModel.find({attributedTo: userId});
  }
}
