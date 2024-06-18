import { BadRequestException, Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ActivityRecord } from 'src/modules/activity/schema/activity.schema';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { ObjectService } from '../../../modules/object/object.service';
import { RelationshipRecord } from '../../../modules/object/schema/relationship.schema';
import { ActivityPubService } from './activity-pub.service';
import { Activity } from '@yuforium/activity-streams';
import { UserActorDto } from '../../../modules/user/dto/user-actor.dto';
import { resolveDomain } from '../../../common/decorators/service-domain.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { ActorDocument, ActorRecord } from '../../object/schema/actor.schema';
import { Model } from 'mongoose';
import { ObjectDto } from '../../../common/dto/object';
import { RelationshipType } from 'src/modules/object/type/relationship.type';

@Injectable()
export class InboxProcessorService {
  protected readonly logger = new Logger(InboxProcessorService.name);
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityPubSerice: ActivityPubService,
    @InjectModel(ActorRecord.name) protected actorModel: Model<ActorDocument>,
  ) { }

  public async create(receivedActivity: ActivityDto, actor: UserActorDto): Promise<Activity | null> {
    const actorRecord = await this.actorModel.findOne({ id: actor.id });

    if (!actorRecord) {
      const url = new URL(actor.id);
      this.actorModel.create(Object.assign({}, actor, {
        _domain: resolveDomain(url.hostname),
        _local: false,
        _public: true
      }));
    }

    const existing = await this.activityService.get(receivedActivity.id);

    if (existing) {
      this.logger.debug('create(): activity already exists');
      return null;
    }

    this.logger.debug(`create(): creating activity ${receivedActivity.id}`);

    const url = new URL(receivedActivity.id);
    const _domain = resolveDomain(url.hostname);

    const activityDto = plainToInstance(ActivityDto, receivedActivity, { excludeExtraneousValues: true });
    const obj = plainToInstance(ObjectDto, receivedActivity.object, { excludeExtraneousValues: true });

    await this.objectService.create(Object.assign({}, obj, await this.objectService.getObjectMetadata(obj)));
    await this.activityService.createActivity(Object.assign({}, receivedActivity, { _local: false, _public: true, _domain }));

    // const activityDto = plainToInstance(ActivityDto, await this.activityService.create(record), {excludeExtraneousValues: true});
    // const objectDto = plainToInstance(ObjectDto, activity.object);

    Object.assign(activityDto, { object: obj });

    return activityDto;
  }

  public async follow(activityDto: ActivityDto, actor: UserActorDto): Promise<Activity | null> {
    this.logger.log(`follow(): ${activityDto.id}`);

    if (!activityDto.id) {
      throw new BadRequestException('Activity must have an ID');
    }

    if (!activityDto.object) {
      throw new Error('Activity does not have an object');
    }

    if (!activityDto.actor) {
      throw new Error('Activity does not have an actor');
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

    const relationshipDto: RelationshipType = Object.assign(
      await this.objectService.assignObjectMetadata({
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${followee.id}/relationship/${_id.toString()}`,
        type: 'Relationship',
        summary: 'Follows',
        attributedTo: followee.id,
      }),
      {
        relationship: 'https://yuforium.com/vocab/relationship/followerOf',
        _relationship: 'followerOf',
        subject: activity.actor,
        object: activity.object as string,
      });

    const relationship = await this.objectService.createRelationship(relationshipDto);
    this.logger.debug(`follow(): created relationship ${relationship.id}`);

    // @todo - if auto accept, accept the follow request, accept it anyway for now
    const _acceptId = this.activityService.id().toString();
    const acceptActivityDto: ActivityRecord = {
      _id: _acceptId,
      _domain: relationship._domain,
      // _path: `${followee._path}/${followee._pathId}/activities`,
      // _pathId: _acceptId,
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

    const acceptActivity = await this.activityService.createActivity(acceptActivityDto);

    // this.activityPubSerice.dispatchToInbox(plainToInstance(ActivityDto, acceptActivity), actor.inbox);

    return acceptActivityDto;
  }

  public async undo() {
    throw new NotImplementedException();
    // const obj = await this.getObjectFromActivity(activity);

    // const activityId = typeof activity.object === 'string' ? activity.object : activity.object.id;

    // if (!activityId) {
    //   throw new Error('Activity does not have an object');
    // }

    // const obj = await this.objectService.get(activityId);

    // if (activityId) {
    //   return this.undoFollow(activityId);
    // }
  }

  protected async undoFollow(object: RelationshipRecord) {
    this.logger.log(`undoFollow(): ${object.id}`);
  }

  protected getObjectFromActivity(activity: Activity) {
    if (!activity.object) {
      throw new Error('Activity does not have an object');
    }

    const object = typeof activity.object === 'string' ? activity.object : activity.object.id;

    if (!object) {
      throw new Error('Activity does not have an object');
    }

    return this.objectService.get(object);
  }
}
