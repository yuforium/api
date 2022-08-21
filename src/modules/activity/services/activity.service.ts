import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ActivityDocument, ActivityRecord } from '../schema/activity.schema';
import { Create } from '@yuforium/activity-streams-validator';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { Model, Types } from 'mongoose';
// import { ObjectService } from '../object/object.service';
// import { ActivityDocument } from '../schema/activity.schema';
// import { SyncActivityStreamService } from './sync-activity-stream.service';

@Injectable()
export class ActivityService {

  protected logger = new Logger(ActivityService.name);

  constructor(
    @InjectModel('Activity') protected readonly activityModel: Model<ActivityDocument>,
    // protected readonly syncStreamService: SyncActivityStreamService,
    // public readonly processor: SyncActivityStreamService
  ) { }

  /**
   * Get an Activity by its id
   * @param id
   * @returns
   */
  public async get(id: string): Promise<ActivityDocument | null> {
    return this.activityModel.findOne({id});
  }

  // public async create(id, serviceId, dto) {
  //   const session = await this.activityModel.db.startSession();

  //   activity.actor = dto.attributedTo;
  //   activity.object = dto;
  //   activity.id = `${id}/activity/${_activityId}`;

  //   await this.processor.dispatch(activity);

  //   return (await this.activityModel.create({_activityId, ...instanceToPlain(activity)})).toObject();
  // }

  /**
   * Create a new activity
   *
   * @param idPrefix
   * @param objectDto
   * @returns
   */
  public async create(activity: ActivityRecord): Promise<any> {
    const session = await this.activityModel.db.startSession();
    const _activityId = new Types.ObjectId(); // this is the internal id

    // activity.actor = objectDto.attributedTo;
    // activity.object = objectDto;
    // activity.id = `${idPrefix}/activity/${_activityId}`;

    // await this.processor.dispatch(activity);

    return (await this.activityModel.create({_activityId, ...instanceToPlain(activity)})).toObject();
  }

  public async importCreate() {
    throw new NotImplementedException();
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
