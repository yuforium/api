import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { Activity, Create } from '@yuforium/activity-streams-validator';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { StreamProcessor } from '../interfaces/stream-processor.interface';

/**
 * Synchronous
 */
@Injectable()
export class SyncStreamService implements StreamProcessor {
  protected readonly logger = new Logger(SyncStreamService.name);

  constructor(protected readonly httpService: HttpService) { }

  public async consume(stream: any) {
    this.logger.debug(`Consuming ${stream.type} activity with id ${stream.id}`);
  }

  protected send(url: string, activity: any): Promise<any> {
    // hacky dev stuff
    url = url
      .replace('https://yuforia.com', 'http://dev.yuforia.com:3000')
      .replace('https://yuforium.com', 'http://dev.yuforium.com:3000');

      return this.httpService.post(url, instanceToPlain(activity))
      .toPromise()
      .then(response => response.data)
      .catch(error => {
        this.logger.error(`Received error "${error.message}" while sending ${activity.type} activity with id ${activity.id} to ${url}`);
        throw error;
      });
  }

  protected getInboxUrl(address: string): Promise<string> {
    // hacky dev stuff
    address = address
      .replace('https://yuforia.com', 'http://dev.yuforia.com:3000')
      .replace('https://yuforium.com', 'http://dev.yuforium.com:3000');

    return this.httpService.get(address)
      .toPromise()
      .then(response => response.data.inbox);
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
            console.log(response);
          }
          catch (error) {
            this.logger.error(`Received error "${error.message}" while sending ${activity.type} activity with id ${activity.id} to ${to}`);
          }
        }
      })
    }
    else {
      throw new NotImplementedException('This stream processor does not support this activity type');
    }
  }
}
