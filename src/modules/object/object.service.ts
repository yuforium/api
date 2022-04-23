import { ConflictException, Injectable } from '@nestjs/common';
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

  public async create(idPrefix: string, idType: string, data: any, id?: string): Promise<ActivityDocument> {
    const _id = new mongoose.Types.ObjectId();
    data.id = `${idPrefix}/${idType}/${id || _id}`;

    const session = await this.objectModel.db.startSession();

    session.startTransaction();

    try {
      const object = await this.objectModel.create({...data, _id});
      const activity = await this.activityService.create(idPrefix, data);

      session.commitTransaction();
      session.endSession();

      return activity;
    }
    catch (error) {
      session.abortTransaction();
      session.endSession();

      if (error.code === 11000) {
        throw new ConflictException('Object already exists');
      }

      throw error;
    }
  }

  public async find(params: any): Promise<any> {
    return this.objectModel.find(params);
  }

  public async getUserOutbox(userId: string): Promise<any> {
    return this.objectModel.find({attributedTo: userId});
  }
}
