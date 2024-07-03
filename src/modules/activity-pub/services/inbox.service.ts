import { BadRequestException, Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { parse, verify, VerifyOptions } from '@yuforium/http-signature';
import { SyncDispatchService } from './sync-dispatch.service';
import { InboxProcessorService } from './inbox-processor.service';
import { ActivityPubService } from './activity-pub.service';
import { InvalidURLException, validateURL } from '../../../common/util/validate-url';
import { resolveDomain } from '../../../common/decorators/service-domain.decorator';

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
   * @param activity Parsed and validated activity object
   * @param raw Raw activity string, to keep the original actviity intact
   * @param options Options for accepting the activity
   */
  public async receive<T extends ActivityDto>(activity: T, raw: string, options?: AcceptOptions) {
    // if requestSignature is provided, verify the signature.  If we don't have a public key for the user, we can't verify the signature, and we
    // should queue processing of the activity for later.

    // will throw an exception if domain is invalid
    const actorURL = new URL(activity.actor);
    resolveDomain(actorURL.hostname);

    if (actorURL.protocol !== 'https') {
      throw new BadRequestException('Actor URL must be HTTPS');
    }

    if (actorURL.port !== '') {
      throw new BadRequestException('Actor URL must operate on default port');
    }

    let actorId!: string;

    try {
      if (typeof activity.actor === 'string') {
        validateURL(activity.actor);
      }
      else {
        throw new BadRequestException('Actor URL is required and must be a string');
      }
    }
    catch (e) {
      if (e instanceof InvalidURLException) {
        throw new BadRequestException(`Invalid actor URL "${activity.actor}": ${e.message}`);
      }
      throw e;
    }

    const response = await fetch(actorId, { headers: { 'Accept': 'application/activity+json' } });
    const actor = await response.json();

    if (options?.requestSignature) {
      const { headers } = options.requestSignature;

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
        this.logger.error(`receive(): signature verification failed for ${activity.actor}`);
        throw new BadRequestException('Signature verification failed');
      }
    }

    this.logger.debug(`receive(): signature verified for ${activity.id}`);

    if (Array.isArray(activity.type)) {
      throw new BadRequestException('Activity type must be a string, multiple values for type are not allowed at this time');
    }

    const type = activity.type.toLowerCase() as 'create' | 'follow' | 'undo';

    if (!type || typeof type !== 'string') {
      throw new BadRequestException('Activity type is required');
    }
    else if (!['create', 'follow', 'undo'].includes(type)) {
      throw new BadRequestException(`The activity type ${type} is not supported`);
    }

    if (this.processor[type]) {
      this.logger.debug(`receive(): processing ${type} activity ${activity.id}`);
      await this.processor[type](activity, raw, actor);
    }
    else {
      throw new Error('This activity type is not supported');
    }
  }

  protected async follow(_activity: ActivityDto, _actor: any): Promise<ActivityDto | null> {
    throw new NotImplementedException();
  }

  protected async undo(_activity: ActivityDto, _actor: any): Promise<ActivityDto | null> {
    throw new NotImplementedException();
  }
}
