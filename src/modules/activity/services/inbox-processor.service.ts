import { BadRequestException, Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { ObjectService } from '../../../modules/object/object.service';
import { RelationshipRecord } from '../../../modules/object/schema/relationship.schema';
import { Activity } from '@yuforium/activity-streams';
import { JwtUserActorDto } from '../../../modules/user/dto/user-actor.dto';
import { resolveDomain } from '../../../common/decorators/service-domain.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { ActorDocument, ActorRecord } from '../../object/schema/actor.schema';
import { Model } from 'mongoose';
import { ObjectDto } from '../../object/dto/object.dto';
import { RelationshipType } from '../../object/type/relationship.type';
import { ActivityRecord } from '../../activity/schema/activity.schema';

@Injectable()
export class InboxProcessorService {
  protected readonly logger = new Logger(InboxProcessorService.name);
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    @InjectModel(ActorRecord.name) protected actorModel: Model<ActorDocument>,
  ) { }

  public async create(receivedActivity: ActivityDto, _raw: string, actor: JwtUserActorDto): Promise<Activity | null> {
    this.logger.debug(`create(): ${receivedActivity.id}`);

    try {
      const actorRecord = await this.actorModel.findOne({ id: actor.id });

      if (!actorRecord) {
        this.logger.debug(`create(): creating actor ${actor.id}`);
        const url = new URL(actor.id);
        await this.actorModel.create({
          ...actor,
          _domain: resolveDomain(url.hostname),
          _local: false,
          _public: true
        });
      }

      const existing = await this.activityService.get(receivedActivity.id);

      if (existing) {
        this.logger.debug('create(): activity already exists, returning null');
        return null;
      }

      this.logger.debug(`create(): creating activity ${receivedActivity.id}`);

      const url = new URL(receivedActivity.id);
      const _domain = resolveDomain(url.hostname);

      const activityDto = plainToInstance(ActivityDto, receivedActivity, {excludeExtraneousValues: true});
      const obj = plainToInstance(ObjectDto, receivedActivity.object, {excludeExtraneousValues: true});

      // @todo create instead of createContent - requires create to inspect the type and route to the appropriate method
      await this.objectService.createContent({
        ...obj,
        ...await this.objectService.getBaseObjectMetadata(obj)
      });
      await this.activityService.createActivity({
        ...receivedActivity,
        _local: false,
        _public: true,
        _domain,
        _raw
      });

      Object.assign(activityDto, { object: obj });

      return activityDto;
    }
    catch (e) {
      this.logger.error('create(): handling exception');
      if (e instanceof Error) {
        this.logger.error(`${e.message}`)
      }
      throw e;
    }
  }

  public async follow(activityDto: ActivityDto, _raw: string, _actor: JwtUserActorDto): Promise<Activity | null> {
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

    const relationshipDto: RelationshipType = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${followee.id}/relationship/${_id.toString()}`,
      type: 'Relationship',
      summary: 'Follows',
      attributedTo: followee.id,
      object: followee.id,
      subject: _actor.id,
      relationship: 'follows'
    };

    const relationship = await this.objectService.create(relationshipDto);
    this.logger.debug(`follow(): created relationship ${relationship.id}`);

    const url = new URL(relationship.id);
    const _domain = resolveDomain(url.hostname);

    // @todo - if auto accept, accept the follow request, accept it anyway for now
    const _acceptId = this.activityService.id().toString();
    const acceptActivityDto: ActivityRecord = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      _id: _acceptId,
      _domain: _domain,
      // _path: `${followee._path}/${followee._pathId}/activities`,
      // _pathId: _acceptId,
      _local: true,
      id: `${followee.id}/activities/${_acceptId}`,
      type: 'Accept',
      actor: followee.id,
      object: activity.id,
      _public: true
    };

    await this.activityService.createActivity(acceptActivityDto);

    return acceptActivityDto;
  }

  public async undo() {
    throw new NotImplementedException();
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
