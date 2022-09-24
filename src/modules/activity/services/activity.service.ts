import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityDocument, ActivityRecordDto } from '../schema/activity.schema';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { ActivityDto } from '../dto/activity.dto';

@Injectable()
export class ActivityService {

  protected logger = new Logger(ActivityService.name);

  constructor(
    @InjectModel('Activity') protected readonly activityModel: Model<ActivityDocument>
  ) { }

  /**
   * Get an Activity by its id
   * @param id
   * @returns
   */
  public async get(id: string): Promise<ActivityDto | null> {
    const activity = this.activityModel.findOne({id});
    if (activity) {
      return plainToInstance(ActivityDto, activity, {excludeExtraneousValues: true});
    }
    return activity;
  }

  /**
   * Create a new activity
   *
   * @param dto
   * @returns
   */
  public async create(dto: ActivityRecordDto): Promise<ActivityDto> {
    this.logger.debug(`Creating activity with id ${dto.id}`);
    const activity = await this.activityModel.create(dto);

    return plainToInstance(ActivityDto, activity, {excludeExtraneousValues: true});
  }

  // public async _create(serviceId: string, idPrefix: string, idType: string, data: any, id?: string): Promise<{activity?: ActivityDocument, object?: ObjectDocument}> {
  //   const _id = new Types.ObjectId();
  //   data.id = `${idPrefix}/${idType}/${id || _id}`;

  //   this.logger.debug(`Creating object with id ${data.id}`);

  //   data._serviceId = serviceId;

  //   const session = await this.objectModel.db.startSession();

  //   session.startTransaction();

  //   try {
  //     const object = await this.objectModel.create({...data, _id});
  //     const activity = await this.activityService.create(idPrefix, data);

  //     session.commitTransaction();
  //     session.endSession();

  //     return {activity, object}
  //   }
  //   catch (error) {
  //     session.abortTransaction();
  //     session.endSession();

  //     if (error.code === 11000) {
  //       throw new ConflictException('Object already exists');
  //     }

  //     throw error;
  //   }
  // }

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
