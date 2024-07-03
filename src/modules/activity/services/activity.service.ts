import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityDocument, ActivityRecord } from '../schema/activity.schema';
import { plainToInstance } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { ActivityDto } from '../dto/activity.dto';

@Injectable()
export class ActivityService {

  protected logger = new Logger(ActivityService.name);

  constructor(
    @InjectModel('Activity') protected readonly activityModel: Model<ActivityDocument>
  ) { }

  public id() {
    return new Types.ObjectId();
  }

  /**
   * Get an Activity by its id
   * @param id
   * @returns
   */
  public async get(id: string): Promise<ActivityDto | null> {
    const activity = await this.activityModel.findOne({id: id.toString()});
    if (activity) {
      return plainToInstance(ActivityDto, activity, {excludeExtraneousValues: true});
    }
    return activity;
  }

  public async createActivity(activity: ActivityRecord): Promise<ActivityDto> {
    const activityRecord = await this.activityModel.create(activity);
    return plainToInstance(ActivityDto, activityRecord, {excludeExtraneousValues: true});
  }

  /**
   * Create a new activity
   *
   * @param dto
   * @returns
   */
  public async create(dto: ActivityRecord): Promise<ActivityDto> {
    const activity = await this.activityModel.create(dto);
    return plainToInstance(ActivityDto, activity, {excludeExtraneousValues: true, exposeUnsetFields: false});
  }

  public async process(activity: any) {
    if (activity.type === 'Create') {
      return Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 16); // @todo use a real, traceable id
    }

    throw new NotImplementedException(`${activity.type} is not supported at this time.`);
  }

  /**
   * Find an activity
   * @param query
   * @returns
   */
  public async find(query: any): Promise<ActivityDocument[]> {
    return this.activityModel.find(query).exec();
  }

  /**
   * Count activities
   * @param query
   * @returns
   */
  public async count(query: object = {}): Promise<number> {
    return this.activityModel.count(query).exec();
  }
}
