import { BadRequestException, Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityService } from '../../../modules/activity/service/activity.service';
import { parse, verify, VerifyOptions } from '@yuforium/http-signature';
import { InvalidURLException, validateURL } from '../../../common/util/validate-url';
import { InboxProcessorService } from './inbox-processor.service';
import { ObjectService } from 'src/modules/object/object.service';
import { ExternalActorDto } from '../dto/external-actor.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ActorDocument, ActorRecord } from '../../../modules/object/schema/actor.schema';
import { Model } from 'mongoose';
import { ActivityRecord } from '../schema/activity.schema';
import { ActorType } from 'src/modules/object/type/actor.type';
import * as crypto from 'crypto';

export type RequestSignature = {
  headers: {
    [k: string]: string | string[] | undefined;
  };
  method: string;
  path: string;
}

export interface ReceiveOptions {
  requestSignature: RequestSignature;
}

@Injectable()
export class InboxService {
  protected logger = new Logger(InboxService.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly processor: InboxProcessorService,
    protected readonly objectService: ObjectService,
    @InjectModel(ActorRecord.name) protected actorModel: Model<ActorDocument>,
  ) { }

  /**
   * Accept an incoming activity.  This is the entry point for all incoming activities.
   * @param activity Parsed and validated activity object
   * @param raw Raw activity string, to keep the original actviity intact
   * @param options Options for accepting the activity
   */
  public async receive<T extends ActivityDto>(activity: T, raw: string, options: ReceiveOptions) {
    // if requestSignature is provided, verify the signature.  If we don't have a public key for the user, we can't verify the signature, and we
    // should queue processing of the activity for later.

    const actorId = validateURL(typeof activity.actor === 'string' ? activity.actor : activity.actor.id);
    const actor = await fetch(actorId, { headers: { 'Accept': 'application/activity+json' } }).then(r => r.json());

    if (actor.id !== actorId) {
      throw new BadRequestException('Actor does not match');
    }

    const verified = this.validateRequestSignature(actor, options.requestSignature);

    if (!verified) {
      this.logger.error(`receive(): signature verification failed for ${activity.actor}`);
      throw new BadRequestException('Signature verification failed');
    }

    this.logger.debug(`receive(): signature verified for ${activity.id}`);

    if (Array.isArray(activity.type)) {
      throw new BadRequestException('Activity type must be a string, multiple values for type are not allowed at this time');
    }

    if (typeof activity.type !== 'string') {
      throw new BadRequestException('Activity type is required');
    }

    const type = activity.type.toLowerCase() as 'create' | 'follow' | 'undo';

    if (!['create', 'follow', 'undo'].includes(type)) {
      throw new BadRequestException(`The activity type ${type} is not supported`);
    }

    if (typeof this.processor[type] === 'function') {
      this.logger.debug(`receive(): processing ${type} activity ${activity.id}`);
      await this.processor[type](activity, raw, actor);
    }
    else {
      throw new Error('This activity type is not supported');
    }
  }

  /**
   * Validate the request signature for an incoming activity
   */
  public async validateRequestSignature(actor: ActorType, requestSignature: RequestSignature) {
    const { headers } = requestSignature;

    if (typeof headers.signature !== 'string') {
      throw new BadRequestException('Signature header is required and must be a string');
    }

    const signature = parse(headers.signature);
    const publicKey = actor.publicKey;

    const verifyOptions: VerifyOptions = {
      method: requestSignature.method,
      requestPath: requestSignature.path,
      signature,
      publicKey: crypto.createPublicKey(publicKey.publicKeyPem),
      headerValues: headers
    };

    return verify(verifyOptions);
  }

  public async follow(activityDto: ActivityDto, actor: ExternalActorDto): Promise<ActivityDto | null> {
    this.logger.log(`follow(): ${activityDto.id}`);

    if (!activityDto.id) {
      throw new Error('Activity must have an ID');
    }

    if (!activityDto.object) {
      throw new Error('Activity does not have an object');
    }

    if (!activityDto.actor) {
      throw new Error('Activity does not have an actor');
    }

    const cachedActor = await this.objectService.get(actor.id);
    if (!cachedActor) {
      await this.actorModel.create(actor);
    }

    // @todo figure out a better way to deal with http ids passed in dev mode
    this.logger.debug(`follow(): finding actorId ${activityDto.object}`);
    const actorId = (activityDto.object as string).replace('http://', 'https://');
    this.logger.debug(`follow(): finding actorId ${actorId}`);
    const followee = await this.objectService.get(actorId);

    if (!followee) {
      throw new Error('Object does not exist');
    }

    if (followee._local) {
      throw new Error('Cannot follow a remote object');
    }

    const activityRecordDto = {
      ...activityDto,
      _domain: followee._domain,
      _local: false,
      _public: true
    };

    this.logger.debug(`follow(): creating activity ${activityRecordDto.id}`);
    const activity = await this.activityService.createActivity(activityRecordDto);
    this.logger.debug(`follow(): created activity ${activity.id}`);

    const _id = this.objectService.id().toString();

    const relationshipDto = await this.objectService.assignObjectMetadata({
      '@context': 'https://www.w3.org/ns/activitystreams',
      attributedTo: typeof activity.actor === 'string' ? activity.actor : activity.actor.id,
      id: `${followee.id}/relationship/${_id.toString()}`,
      type: 'Relationship',
      summary: 'Follows',
      relationship: 'https://yuforium.com/vocab/relationship/followerOf',
      _relationship: 'followerOf',
      subject: typeof activity.actor === 'string' ? activity.actor : activity.actor.id,
      object: activity.object as string,
      _domain: followee._domain,
      _public: true,
      _local: true,
      to: []
    });

    const relationship = await this.objectService.createRelationship(relationshipDto);
    this.logger.debug(`follow(): created relationship ${relationship.id}`);

    // @todo - if auto accept, accept the follow request, accept it anyway for now
    const _acceptId = this.activityService.id().toString();
    const acceptActivityDto: ActivityRecord = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      _id: _acceptId,
      _domain: relationship._domain,
      _local: true,
      id: `${followee.id}/activities/${_acceptId}`,
      type: 'Accept',
      actor: followee.id,
      object: activity.id,
      _public: true
    };

    await this.activityService.createActivity(acceptActivityDto);

    // this.activityPubSerice.dispatchToInbox(plainToInstance(ActivityDto, acceptActivity), actor.inbox);

    return acceptActivityDto;
  }

  protected async undo(_activity: ActivityDto, _actor: any): Promise<ActivityDto | null> {
    throw new NotImplementedException();
  }
}
