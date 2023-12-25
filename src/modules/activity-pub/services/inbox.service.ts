import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { parse, verify, VerifyOptions } from '@yuforium/http-signature';
import { SyncDispatchService } from './sync-dispatch.service';
import { InboxProcessorService } from './inbox-processor.service';
import { ActivityPubService } from './activity-pub.service';

export interface AcceptOptions {
  requestSignature?: {
    headers: {
      [key: string]: string | string[] | undefined;
    };
    publicKey?: string;
    method: string;
    path: string;
  }
}

@Injectable()
export class InboxService {
  protected logger = new Logger(InboxService.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly processor: InboxProcessorService,
    protected readonly activityPubService: ActivityPubService,
    protected readonly outboxService: SyncDispatchService
  ) { }

  /**
   * Accept an incoming activity.  This is the entry point for all incoming activities.
   */
  public async accept<T extends ActivityDto>(activity: T, options?: AcceptOptions) {
    // if requestSignature is provided, verify the signature.  If we don't have a public key for the user, we can't verify the signature, and we
    // should queue processing of the activity for later.
    // const {requestSignature} = options || {};

    // @todo domain checking can be moved into activity dto validation
    // const parsedUrl = new URL(activity.actor);
    
    // if (!psl.isValid(parsedUrl.hostname) && (parsedUrl.hostname.substring(parsedUrl.hostname.length -6) !== '.local')) {
    //   throw new TypeError('Invalid URL');
    // }

    const response = await fetch(activity.actor, {headers: {'Accept': 'application/activity+json'}});
    const actor = await response.json();

    if (options?.requestSignature) {
      const {headers} = options.requestSignature;

      if (typeof headers.signature !== 'string') {
        throw new BadRequestException('Signature header is required');
      }

      const signature = parse(headers.signature);
      const publicKey = actor.publicKey;
      
      /**
       * @todo the activity could have its actor in JSON format, which would require comparing against activity.actor.id
       */
      if (actor.id !== activity.actor) {
        throw new BadRequestException('Actor does not match');
      }

      const verifyOptions: VerifyOptions = {
        method: options.requestSignature.method,
        requestPath: options.requestSignature.path,
        signature,
        publicKey: publicKey.publicKeyPem,
        headerValues: headers
      };

      const verified = verify(verifyOptions);

      if (!verified) {
        this.logger.error(`accept(): signature verification failed for ${activity.actor}`);
        throw new BadRequestException('Signature verification failed');
      }
    }

    this.logger.debug(`accept(): signature verified for ${activity.id}`);

    if (Array.isArray(activity.type)) {
      throw new Error('Activity type must be a string, multiple values for type are not allowed at this time');
    }

    const type = activity.type.toLowerCase() as 'create' | 'follow' | 'undo';

    if (!type || typeof type !== 'string') {
      throw new Error('Activity type is required');
    }
    else if (!['create', 'follow', 'undo'].includes(type)) {
      throw new Error(`The activity type ${type} is not supported`);
    }

    if (this.processor[type]) {
      this.logger.debug(`accept(): processing ${type} activity ${activity.id}`);
      await this.processor[type](activity, actor);
    }
    else {
      throw new Error('This activity type is not supported');
    }
  }

  protected async create(activity: ActivityDto): Promise<ActivityDto | null> {
    if (await this.activityService.find({id: activity.id})) {
      this.logger.debug('acceptCreate(): activity already exists');
      return null;
    }

    // @todo broken for now
    // const activityDto = plainToInstance(ActivityDto, await this.activityService.create(activity), { excludeExtraneousValues: true });

    // return activityDto;
    return null;
  }
}
