import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectDocument } from './schema/object.schema';
import * as mongoose from 'mongoose';
import { ActivityService } from '../activity/services/activity.service';
import { ActivityDocument } from '../activity/schema/activity.schema';

@Injectable()
export class ObjectService {
  protected readonly logger = new Logger(ObjectService.name);

  constructor(
    @InjectModel('Object') protected objectModel: Model<ObjectDocument>,
    protected activityService: ActivityService
  ) { }

  public async get(id: string): Promise<ObjectDocument> {
    return this.objectModel.findOne({id});
  }

  public async create(serviceId: string, idPrefix: string, idType: string, data: any, id?: string): Promise<{activity: ActivityDocument, object: ObjectDocument}> {
    const _id = new mongoose.Types.ObjectId();
    data.id = `${idPrefix}/${idType}/${id || _id}`;
    this.logger.debug(`Creating object with id ${data.id}`);

    data._serviceId = serviceId;

    const session = await this.objectModel.db.startSession();

    session.startTransaction();

    try {
      const object = await this.objectModel.create({...data, _id});
      const activity = await this.activityService.create(idPrefix, data);

      session.commitTransaction();
      session.endSession();

      return {activity, object}
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

  public async findById(id: string|mongoose.Schema.Types.ObjectId): Promise<any> {
    return this.objectModel.findById(id);
  }

  public async find(params: any = {}, options: any = {}): Promise<any> {
    return this.objectModel.find(params, {}, options);
  }

  public async findOne(params: any): Promise<any> {
    return this.objectModel.findOne(params);
  }

  public async getUserOutbox(userId: string): Promise<any> {
    return this.objectModel.find({attributedTo: userId});
  }
}
