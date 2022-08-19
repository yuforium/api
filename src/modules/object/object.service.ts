import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectDocument } from './schema/object.schema';
import { Model, Types, Schema, Connection } from 'mongoose';
import { ActivityService } from '../activity/services/activity.service';
import { ActivityDocument } from '../activity/schema/activity.schema';
import { MongoServerError } from 'mongodb';

@Injectable()
export class ObjectService {
  protected readonly logger = new Logger(ObjectService.name);

  constructor(
    @InjectModel('Object') protected objectModel: Model<ObjectDocument>,
    @InjectConnection() protected connection: Connection,
    protected activityService: ActivityService
  ) { }

  public async get(id: string): Promise<ObjectDocument | null> {
    return this.objectModel.findOne({id});
  }

  // public async create(id: string, serviceId: string, dto: any): Promise<ObjectDocument>
  public async create(serviceId: string, idPrefix: string, idType: string, data: any, id?: string): Promise<{activity: ActivityDocument, object: ObjectDocument}> {
    const _id = new Types.ObjectId();
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
    catch (error: unknown) {
      session.abortTransaction();
      session.endSession();

      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException('Object already exists');
      }

      throw error;
    }
  }

  public async findById(id: string|Schema.Types.ObjectId): Promise<any> {
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
