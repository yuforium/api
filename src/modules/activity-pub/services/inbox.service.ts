import { BadRequestException, Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { parse, verify, VerifyOptions } from '@yuforium/http-signature';
import { APActivity, APActor, OutboxService } from './outbox.service';
import { InboxProcessorService } from './inbox-processor.service';
import { ActivityPubService } from './activity-pub.service';

type APInboxProcessorType = 'create' | 'follow';

type ProcessorFunction = (activity: APActivity, actor: APActor) => Promise<APActivity | null>;

export interface APInboxProcessor {
  create: ProcessorFunction;
  follow: ProcessorFunction;
}

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
    protected readonly outboxService: OutboxService
  ) { }

  /**
   * Accept an incoming activity.
   */
  public async accept<T extends APActivity>(activity: T, options?: AcceptOptions) {
    // if requestSignature is provided, verify the signature.  If we don't have a public key for the user, we can't verify the signature, and we
    // should queue processing of the activity for later.
    const {requestSignature} = options || {};
    const response = await fetch(activity.actor, {headers: {'Accept': 'application/activity+json'}});
    const actor = await response.json();

    if (options?.requestSignature) {
      const {headers} = options.requestSignature;

      if (typeof headers.signature !== 'string') {
        throw new BadRequestException();
      }

      const signature = parse(headers.signature);
      const publicKey = actor.publicKey;

      /**
       * @todo the activity could have its actor in JSON format, which would require comparing against activity.actor.id
       */
      if (actor.id !== activity.actor) {
        throw new BadRequestException();
      }

      const verifyOptions: VerifyOptions = {
        method: options.requestSignature.method,
        requestPath: options.requestSignature.path,
        signature,
        publicKey: publicKey.publicKeyPem,
        headerValues: headers
      }

      const verified = verify(verifyOptions);

      if (!verified) {
        throw new BadRequestException();
      }
    }

    if (Array.isArray(activity.type)) {
      throw new Error('Activity type must be a string, multiple values for type are not allowed at this time');
    }

    const type = activity.type.toLowerCase() as 'create' | 'follow';

    if (!type || typeof type !== 'string') {
      throw new Error();
    }

    if (this.processor[type]) {
      await this.processor[type](activity, actor);
    }
    else {
      throw new NotImplementedException('This activity type is not supported');
    }
  }

  protected async undo(activity: ActivityDto): Promise<ActivityDto | null> {

    console.log(`processing an undo request`, activity);
    return null;
  }

  protected async follow(activity: ActivityDto): Promise<ActivityDto | null> {
    console.log(`processing a follow request`, activity);
    return null;
  }

  protected async create(activity: ActivityDto): Promise<ActivityDto | null> {
    if (await this.activityService.find({id: activity.id})) {
      this.logger.debug(`acceptCreate(): activity already exists`);
      return null;
    }

    // @todo broken for now
    // const activityDto = plainToInstance(ActivityDto, await this.activityService.create(activity), { excludeExtraneousValues: true });

    // return activityDto;
    return null;
  }
}
