import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { ObjectService } from '../../../modules/object/object.service';
import { RelationshipRecordDto } from '../../../modules/object/schema/relationship.schema';
import { ActivityPubService } from './activity-pub.service';
import { APInboxProcessor } from './inbox.service';
import { APActivity, APActor } from './outbox.service';


@Injectable()
export class InboxProcessorService implements APInboxProcessor {
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityPubSerice: ActivityPubService) { }

  public async create(activity: APActivity, actor: APActor): Promise<APActivity> {
    throw new Error('Method not implemented.');
  }

  public async follow(followDto: APActivity, actor: APActor): Promise<APActivity | null> {
    if (!followDto.id) {
      throw new Error('Activity must have an ID');
    }

    if (!followDto.object) {
      throw new Error('Activity does not have an object');
    }

    if (!followDto.actor) {
      throw new Error('Activity does not have an actor');
    }

    const followee = await this.objectService.get(followDto.object as string);

    if (!followee) {
      throw new Error('Object does not exist');
    }

    console.log('the follow dto is', followDto);

    const follow = await this.activityService.createActivity(followDto);

    console.log('the created follow activity is', follow);

    const _id = this.objectService.id().toString();

    const relationshipDto: RelationshipRecordDto = {
      _id,
      id: `${followee.id}/relationship/${_id.toString()}`,
      type: 'Relationship',
      summary: 'Follows',
      relationship: 'https://yuforium.com/vocab/relationship/followerOf',
      _relationship: 'followerOf',
      subject: follow.actor,
      object: follow.object as string,
      _serviceId: followee._serviceId,
    }

    const relationship = await this.objectService.createRelationship(relationshipDto);

    // @todo - if auto accept, accept the follow request, accept it anyway for now
    const _acceptId = this.activityService.id().toString();
    const acceptActivityDto = Object.assign(new ActivityDto(), {
      _id: _acceptId,
      _serviceId: relationship._serviceId,
      id: `${followee.id}/activity/${_acceptId}`,
      type: 'Accept',
      actor: followee.id,
      object: followee.id
    });
    // const acceptActivity = await this.activityService.createActivity(acceptActivityDto);

    const acceptActivity = await this.activityService.createActivity(acceptActivityDto);

    this.activityPubSerice.dispatchToInbox(plainToInstance(ActivityDto, acceptActivity), actor.inbox);

    return acceptActivityDto;
  }
}
