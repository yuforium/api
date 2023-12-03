import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ActivityRecordDto } from 'src/modules/activity/schema/activity.schema';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { ObjectService } from '../../../modules/object/object.service';
import { RelationshipRecordDto } from '../../../modules/object/schema/relationship.schema';
import { ActivityPubService } from './activity-pub.service';
import { APInboxProcessor } from './inbox.service';
import { APActivity, APActor } from './outbox-dispatch.service';


@Injectable()
export class InboxProcessorService implements APInboxProcessor {
  protected readonly logger = new Logger(InboxProcessorService.name);
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityPubSerice: ActivityPubService) { }

  public async create(activity: APActivity, actor: APActor): Promise<APActivity> {
    throw new Error('Method not implemented.');
  }

  public async follow(activityDto: APActivity, actor: APActor): Promise<APActivity | null> {
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
      // _path: `${followee._path}/${followee._pathId}/activities/${activityDto.id}`,
      // _pathId: activityDto.id,
      _local: false
    };

    // console.log(activityRecordDto);

    this.logger.debug(`follow(): creating activity ${activityRecordDto.id}`);
    const activity = await this.activityService.createActivity(activityRecordDto);
    this.logger.debug(`follow(): created activity ${activity.id}`);

    const _id = this.objectService.id().toString();

    const relationshipDto: RelationshipRecordDto = {
      id: `${followee.id}/relationship/${_id.toString()}`,
      type: 'Relationship',
      summary: 'Follows',
      relationship: 'https://yuforium.com/vocab/relationship/followerOf',
      _relationship: 'followerOf',
      subject: activity.actor,
      object: activity.object as string,
      _domain: followee._domain,
      // _path: `${followee._path}/${followee._pathId}/relationships/${_id.toString()}`,
      // _pathId: _id.toString(),
      _public: true,
      _local: true,
      to: []
    };

    const relationship = await this.objectService.createRelationship(relationshipDto);
    this.logger.debug(`follow(): created relationship ${relationship.id}`);

    // @todo - if auto accept, accept the follow request, accept it anyway for now
    const _acceptId = this.activityService.id().toString();
    const acceptActivityDto: ActivityRecordDto = {
      _id: _acceptId,
      _domain: relationship._domain,
      // _path: `${followee._path}/${followee._pathId}/activities`,
      // _pathId: _acceptId,
      _local: true,
      id: `${followee.id}/activities/${_acceptId}`,
      type: 'Accept',
      actor: followee.id,
      object: activity.id
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

    this.activityPubSerice.dispatchToInbox(plainToInstance(ActivityDto, acceptActivity), actor.inbox);

    return acceptActivityDto;
  }

  public async undo(activity: APActivity, actor: APActor) {
    const obj = await this.getObjectFromActivity(activity);

    const activityId = typeof activity.object === 'string' ? activity.object : activity.object.id;

    if (!activityId) {
      throw new Error('Activity does not have an object');
    }

    // const obj = await this.objectService.get(activityId);
    
    // if (activityId) {
    //   return this.undoFollow(activityId);
    // }
  }

  protected async undoFollow(object: RelationshipRecordDto) {
    this.logger.log(`undoFollow(): ${object.id}`);
  }

  protected getObjectFromActivity(activity: APActivity) {
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
