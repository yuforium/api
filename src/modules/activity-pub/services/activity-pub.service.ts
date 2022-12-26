import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ActivityDto } from 'src/modules/activity/dto/activity.dto';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { instanceToPlain, serialize } from 'class-transformer';
import { ObjectDto } from 'src/common/dto/object/object.dto';
import { LinkDto } from 'src/modules/link/dto/link.dto';

export interface DispatchOptions {
  requestSignature?: {

  }
}

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

  /**
   * Dispatch an activity to a remote actor
   *
   * @param activity
   * @param to
   * @param options
   * @returns
   */
  public async dispatch(activity: ActivityDto, to: string | string[]): Promise<any> {
    const obj = activity.object;

    if (obj instanceof LinkDto) {
      this.logger.warn('dispatch(): Object is not an ObjectDto and is likely a LinkDto and needs to be resolved');
      return;
    }

    to = Array.isArray(to) ? to : [to];

    to.filter(i => i !== 'https://www.w3.org/ns/activitystreams#Public')
      .forEach(async (recipient: string) => {
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

  /**
   * Dispatch an activity to a remote inbox
   * @param activity
   * @param inbox
   */
  public async dispatchToInbox(activity: ActivityDto, inbox: string | string[]) {
    inbox = Array.isArray(inbox) ? inbox : [inbox];

    inbox
      .filter(i => i !== 'https://www.w3.org/ns/activitystreams#Public')
      .forEach(async (recipient: string) => {
        this.logger.debug(`dispatchToInbox(): Sending ${activity.type} activity with id ${activity.id} to ${recipient}`);
        await this.sendNew(recipient, activity);
      });
  }

  protected async sendNew(url: string, activity: any): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/activity+json',
        'Accept': 'application/activity+json',
      },
      body: JSON.stringify(activity),
    });

    console.log(response);

    return response;

    // return firstValueFrom(this.httpService.post<string>(url, activity))
    //   .then((response: AxiosResponse | undefined) => {
    //     if (response !== undefined) {
    //       this.logger.debug(`sendNew(): Sent ${activity.type} activity with id ${activity.id} to ${url}`);
    //       return response.data;
    //     }
    //   })
    //   .catch(error => {
    //     this.logger.error(`sendNew(): "${error.message}" sending ${activity.type} id ${activity.id} to ${url}`);
    //     if (typeof error.response?.data?.message === 'string') {
    //       this.logger.error(error.response.data.message);
    //     }

    //     if (Array.isArray(error.response?.data?.message)) {
    //       error.response.data.message.forEach((e: any) => {
    //         this.logger.error(e);
    //       });
    //     }
    //   });
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

  protected async getInboxUrl(address: string): Promise<string> {
    // hacky dev stuff
    address = address
      .replace('https://yuforia.com', 'http://dev.yuforia.com:3000')
      .replace('https://yuforium.com', 'http://dev.yuforium.com:3000');

    this.logger.debug(`getInboxUrl(): Getting inbox url for ${address}`);

    const actor = await fetch(address, {headers: {'Accept': 'application/activity+json'}}).then(res => res.json);

    return (actor as any).inbox;

    // return firstValueFrom(this.httpService.get(address))
    //   .then((response: AxiosResponse | undefined) => {
    //     if (response === undefined) {
    //       throw new Error('No response');
    //     }
    //     console.log(response.data);
    //     this.logger.debug('Found inbox url: ' + response.data.inbox);
    //     return response.data.inbox;
    //   })
    //   .catch(error => {
    //     this.logger.error(`getInboxUrl(): Received error "${error.message}" while getting inbox url for ${address}`);
    //     throw error;
    //   });
  }
}
