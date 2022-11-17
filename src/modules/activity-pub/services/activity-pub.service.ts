import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ActivityDto } from 'src/modules/activity/dto/activity.dto';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { instanceToPlain, serialize } from 'class-transformer';
import { ObjectDto } from 'src/common/dto/object/object.dto';
import { LinkDto } from 'src/modules/link/dto/link.dto';

/**
 * Service responsible for interacting with (sending and receiving activities) to remote services
 * Also used to fetch remote objects
 */
@Injectable()
export class ActivityPubService {
  protected readonly logger = new Logger(ActivityPubService.name);

  constructor(
    protected readonly httpService: HttpService,
  ) { }

  public async dispatch(activity: ActivityDto) {
    const obj = activity.object;

    if (obj instanceof LinkDto) {
      this.logger.warn('dispatch(): Object is not an ObjectDto and is likely a LinkDto and should be resolved');
      return;
    }

    const to = obj.to ? Array.isArray(obj.to) ? obj.to : [obj.to] : [];

    to.forEach(async (recipient: string) => {
      if (recipient === 'https://www.w3.org/ns/activitystreams#Public') {
        return;
      }

      const url = await this.getInboxUrl(recipient.toString());
      this.logger.debug(`dispatch(): Sending ${activity.type} activity with id ${activity.id} to ${recipient}`);
      await this.send(url, activity);
    });
    // iterate through the "to" field, and send the activity to each of the services
    // scenarios -
    // to self
    // to users on same service
    // to user on another service
  }

  protected async send(url: string, activity: any): Promise<any> {
    // hacky dev stuff
    url = url
      .replace('https://yuforia.com', 'http://dev.yuforia.com:3000')
      .replace('https://yuforium.com', 'http://dev.yuforium.com:3000');

      return firstValueFrom(this.httpService.post<string>(url, instanceToPlain(activity)))
        .then((response: AxiosResponse | undefined) => {
          if (response !== undefined) {
            this.logger.debug(`send(): Sent ${activity.type} activity with id ${activity.id} to ${url}`);
            return response.data;
          }
        })
        .catch(error => {
          this.logger.error(`send(): "${error.message}" sending ${activity.type} id ${activity.id} to ${url}`);
          if (typeof error.response?.data?.message === 'string') {
            this.logger.error(error.response.data.message);
          }

          if (Array.isArray(error.response?.data?.message)) {
            error.response.data.message.forEach((e: any) => {
              this.logger.error(e);
            });
          }
        });
  }

  protected getInboxUrl(address: string): Promise<string> {
    // hacky dev stuff
    address = address
      .replace('https://yuforia.com', 'http://dev.yuforia.com:3000')
      .replace('https://yuforium.com', 'http://dev.yuforium.com:3000');

    this.logger.debug(`getInboxUrl(): Getting inbox url for ${address}`);
    return firstValueFrom(this.httpService.get(address))
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
}
