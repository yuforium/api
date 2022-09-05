import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectDocument, ObjectRecordDto } from './schema/object.schema';
import { Model, Types, Schema, Connection } from 'mongoose';
import { ActivityService } from '../activity/services/activity.service';
import { ActivityDocument } from '../activity/schema/activity.schema';
import { MongoServerError } from 'mongodb';
import { instanceToPlain } from 'class-transformer';
import { ActivityDto } from '../activity/dto/activity.dto';
import { ServiceId } from 'src/common/types/service-id.type';
import { ObjectDto } from './dto/object.dto';
import { Actor } from '@yuforium/activity-streams-validator';

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

  public async create(dto: ObjectRecordDto): Promise<any> {
    this.logger.debug(`Creating object with id ${dto.id}`);
    const object = await this.objectModel.create(dto);
    return object;
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
