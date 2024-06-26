import { BadRequestException, Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ActivityDto } from '../dto/activity.dto';
import { AcceptOptions } from '../interface/accept-options.interface';
import { VerifyOptions, parse, verify } from '@yuforium/http-signature';
import { ExternalActorDto } from '../dto/external-actor.dto';
import { ObjectService } from '../../object/object.service';
import { ActivityService } from './activity.service';
import { ActivityRecord } from '../schema/activity.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ActorDocument, ActorRecord } from '../../object/schema/actor.schema';
import { Model } from 'mongoose';
import { RelationshipType } from '../../../modules/object/type/relationship.type';

@Injectable()
export class InboxService {
  protected logger = new Logger(InboxService.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    @InjectModel(ActorRecord.name) protected actorModel: Model<ActorDocument>,
  ) { }

  /**
   * Receive an activity
   */
  public async receive<T extends ActivityDto = ActivityDto>(activity: T, options?: AcceptOptions) {
    // if requestSignature is provided, verify the signature.  If we don't have a public key for the user, we can't verify the signature, and we
    // should queue processing of the activity for later.
    // const {requestSignature} = options || {};

    // @todo domain checking can be moved into activity dto validation
    // const parsedUrl = new URL(activity.actor);

    // if (!psl.isValid(parsedUrl.hostname) && (parsedUrl.hostname.substring(parsedUrl.hostname.length -6) !== '.local')) {
    //   throw new TypeError('Invalid URL');
    // }

    const response = await fetch(activity.actor, { headers: { 'Accept': 'application/activity+json' } });
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
      throw new NotImplementedException(`The activity type ${type} is not supported`);
    }

    /**
     * @todo for now, we will process activities synchronously in this class, in the future we should break this
     * functionality out into separate classes that can be injected in the constructor (e.g. an async stream processor for
     * production level loads or sync processor for dev work)
     */
    await this[type](activity, actor);
  }

  public async create(activity: ActivityDto, actor: ExternalActorDto): Promise<ActivityDto | null> {
    activity;
    actor;
    throw new NotImplementedException();
    return null;
  }

  public async undo(activity: ActivityDto, actor: ExternalActorDto): Promise<ActivityDto | null> {
    activity;
    actor;
    throw new NotImplementedException();
    return null;
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

    const relationshipDto: RelationshipType = await this.objectService.assignObjectMetadata({
      '@context': 'https://www.w3.org/ns/activitystreams',
      attributedTo: activity.actor,
      id: `${followee.id}/relationship/${_id.toString()}`,
      type: 'Relationship',
      summary: 'Follows',
      relationship: 'https://yuforium.com/vocab/relationship/followerOf',
      _relationship: 'followerOf',
      subject: activity.actor,
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

    // Object.assign(new ActivityDto(), {
    //   _id: _acceptId,
    //   _serviceId: relationship._hostname,
    //   id: `${followee.id}/activity/${_acceptId}`,
    //   type: 'Accept',
    //   actor: followee.id,
    //   object: followee.id
    // });
    // const acceptActivity = await this.activityService.createActivity(acceptActivityDto);

    await this.activityService.createActivity(acceptActivityDto);

    // this.activityPubSerice.dispatchToInbox(plainToInstance(ActivityDto, acceptActivity), actor.inbox);

    return acceptActivityDto;
  }
}
