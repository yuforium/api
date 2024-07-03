import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ASActivity, ASObject } from '@yuforium/activity-streams';
import { instanceToPlain } from 'class-transformer';
import { StreamProcessor } from '../interfaces/stream-processor.interface';
import { Connection, Types } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { ActivityService } from '../../activity/services/activity.service';
import { ActivityDto } from '../../activity/dto/activity.dto';
import { lastValueFrom, map } from 'rxjs';

interface ActivityStreamService {
  accept(activity: ActivityDto, serviceId?: string): Promise<boolean>;
}

// type allowed = 'create' | 'update' | 'delete';

/**
 * Synchronous activity stream service
 */
@Injectable()
export class SyncActivityStreamService implements StreamProcessor, ActivityStreamService {
  protected readonly logger = new Logger(SyncActivityStreamService.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly httpService: HttpService,
    @InjectConnection() protected readonly connection: Connection
  ) { }

  public async id() {
    return new Types.ObjectId();
  }

  /**
   * Accept an activity from an external source
   *
   * @param activity
   */
  public async accept(activity: ActivityDto) {
    this.logger.debug(`Ingesting ${activity.type} activity with id ${activity.id}`);
    // this[activity.type as allowed](activity);
    return true;
  }

  /**
   * Produce an activity from a known service
   * @param activity
   * @param serviceDomain
   */
  public async produce() {
    throw new NotImplementedException('This stream processor does not support this activity type');
  }

  /**
   *
   * @param activityDto
   * @param serviceDomain
   * @returns The newly created activity
   */
  protected async create(): Promise<boolean> {
    throw new NotImplementedException();
  }

  public async update() {

  }

  public async delete() {

  }

  /**
   * Consumes an activity
   * @param activity
   */
  public async consume(activity: ASActivity) {
    this.logger.debug(`Consuming ${activity.type} activity with id ${activity.id}`);
  }

  protected async send(url: string, activity: any): Promise<string> {
    return lastValueFrom(this.httpService.post<string>(url, instanceToPlain(activity))
      .pipe(
        map(response => response.data)
      )
    );
  }

  protected async getInboxUrl(address: string): Promise<string> {
    this.logger.debug(`Getting inbox url for ${address}`);
    return lastValueFrom(this.httpService.get(address)
      .pipe(
        map(response => {
          if (response === undefined) {
            throw new Error('no response');
          }
          return response.data.inbox;
        })
      )
    );
  }

  public async getAddressees(activity: ASActivity) {
    const obj = activity.object as ASObject;
    return Array.isArray(obj.to) ? obj.to : [obj.to];
  }

  public async dispatch(activity: ASActivity) {
    const addressees = await this.getAddressees(activity);

    if (activity.type === 'Create') {
      addressees.forEach(async (to: any) => {
        if (to !== 'https://www.w3.org/ns/activitystreams#Public') {
          this.logger.debug(`Sending ${activity.type} activity with id ${activity.id} to ${to}`);

          try {
            // @todo - is this one of ours? if so we can skip it, no need to replicate it to our own database
            // const inbox = await this.getInboxUrl(to);
            // const response = await this.send(inbox, instanceToPlain(activity));
          }
          catch (error: unknown) {
            this.logger.error(`dispatch(): "${String(error)}" while sending ${activity.type} activity with id ${activity.id} to ${to}`);
          }
        }
      });
    }
    else {
      throw new NotImplementedException('This stream processor does not support this activity type');
    }
  }
}
