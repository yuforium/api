import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { Activity, Create } from '@yuforium/activity-streams-validator';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { StreamProcessor } from '../interfaces/stream-processor.interface';
import { Connection, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { AxiosResponse } from 'axios';
import { ServiceId } from 'src/common/types/service-id.type';
import { ActivityService } from 'src/modules/activity/services/activity.service';
import { ActivityDto } from 'src/common/dto/activity.dto';

type allowed = 'create' | 'update' | 'delete';

/**
 * Synchronous activity stream service
 */
@Injectable()
export class SyncActivityStreamService implements StreamProcessor {
  protected readonly logger = new Logger(SyncActivityStreamService.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly httpService: HttpService,
    @InjectConnection() protected readonly connection: Connection,
    typeHandlers = {}
  ) { }

  public async id() {
    return new Types.ObjectId();
  }

  public async ingest(activity: ActivityDto, serviceId?: ServiceId) {
    this.logger.debug(`Ingesting ${activity.type} activity with id ${activity.id}`);
    this[activity.type as allowed](activity);
  }

  public async create(activityDto: ActivityDto, serviceId?: ServiceId) {
    const activityId = await this.id();
    const activityParams = {
      ...activityDto,
      _serviceId: serviceId,
      _id: activityId,
      id: `${activityDto.actor}/activity/${activityId}`
    };

    const session = await this.connection.startSession();

    session.startTransaction();

    try {
      this.activityService.create(activityParams);
      await session.commitTransaction();
    }
    catch (error: unknown) {
      await session.abortTransaction();
    }

    return true;
  }

  public async update(activity: ActivityDto) {

  }

  public async delete(activity: ActivityDto) {

  }

  /**
   * Consumes an activity
   * @param activity
   */
  public async consume(activity: Activity) {
    this.logger.debug(`Consuming ${activity.type} activity with id ${activity.id}`);
  }

  protected send(url: string, activity: any): Promise<any> {
    // hacky dev stuff
    url = url
      .replace('https://yuforia.com', 'http://dev.yuforia.com:3000')
      .replace('https://yuforium.com', 'http://dev.yuforium.com:3000');

      return this.httpService.post<string>(url, instanceToPlain(activity))
      .toPromise()
      .then((response: AxiosResponse | undefined) => {
        if (response !== undefined) {
          return response.data;
        }
      })
      .catch(error => {
        this.logger.error(`send(): "${error.message}" while sending ${activity.type} activity with id ${activity.id} to ${url}`);
        throw error;
      });
  }

  protected getInboxUrl(address: string): Promise<string> {
    // hacky dev stuff
    address = address
      .replace('https://yuforia.com', 'http://dev.yuforia.com:3000')
      .replace('https://yuforium.com', 'http://dev.yuforium.com:3000');

    this.logger.debug(`Getting inbox url for ${address}`);
    return this.httpService.get(address)
      .toPromise()
      .then((response: AxiosResponse | undefined) => {
        if (response === undefined) {
          throw new Error('No response');
        }

        this.logger.debug('Found inbox url: ' + response.data.inbox);
        return response.data.inbox;
      })
      .catch(error => {
        this.logger.error(`getInboxUrl(): Received error "${error.message}" while getting inbox url for ${address}`);
        throw error;
      });
  }

  public async dispatch(activity: Activity) {
    if (activity instanceof Create) {

      (activity.object?.to as any)?.forEach(async (to: any) => {
        if (to !== 'https://www.w3.org/ns/activitystreams#Public') {
          this.logger.debug(`Sending ${activity.type} activity with id ${activity.id} to ${to}`);

          try {
            // @todo - is this one of ours? if so we can skip it, no need to replicate it to our own database
            const inbox = await this.getInboxUrl(to);
            const response = await this.send(inbox, instanceToPlain(activity));
          }
          catch (error: unknown) {
            this.logger.error(`dispatch(): "${String(error)}" while sending ${activity.type} activity with id ${activity.id} to ${to}`);
          }
        }
      })
    }
    else {
      throw new NotImplementedException('This stream processor does not support this activity type');
    }
  }
}
