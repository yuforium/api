import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectDocument, ObjectRecordDto, ObjectSchema } from './schema/object.schema';
import { Model, Types, Schema, Connection } from 'mongoose';
import { ActivityService } from '../activity/services/activity.service';
import { ActivityDocument } from '../activity/schema/activity.schema';
import { MongoServerError } from 'mongodb';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ActivityDto } from '../activity/dto/activity.dto';
import { ServiceId } from 'src/common/types/service-id.type';
import { ObjectDto } from '../../common/dto/object/object.dto';
import { Actor, ASObject } from '@yuforium/activity-streams';
import { APObject, APObjectService } from '../activity-pub/services/outbox.service';
import { PersonDto } from 'src/common/dto/object/person.dto';
import { RelationshipDocument, RelationshipRecordDto, RelationshipSchema } from './schema/relationship.schema';
import { RelationshipDto } from 'src/common/dto/object/relationship.dto';
import { ObjectCreateDto } from 'src/common/dto/object-create/object-create.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ObjectService {
  protected readonly logger = new Logger(ObjectService.name);

  constructor(
    @InjectModel('Object') protected objectModel: Model<ObjectDocument>,
    @InjectModel('Relationship') protected relationshipModel: Model<RelationshipDocument>,
    @InjectConnection() protected connection: Connection,
    protected configService: ConfigService,
    protected activityService: ActivityService
  ) { }

  public async get(id: string): Promise<ObjectDocument | null> {
    return this.objectModel.findOne({id});
  }

  public async getByPath(_serviceId: string, _servicePath: string, _servicePathId: string) {
    return this.objectModel.findOne({_serviceId, _servicePath, _servicePathId});
  }

  public id() {
    return new Types.ObjectId();
  }

  public async create(dto: ObjectRecordDto): Promise<ObjectDto> {
    try {
      const obj = await this.objectModel.create(dto);
      return plainToInstance(ObjectDto, obj);
    }
    catch (err) {
      this.logger.error(`create(): ${(err as Error).message}`)
      throw err;
    }
    // return await this.createObject(dto, options);

    // return {
    //   record,
    //   object: record.toObject(),
    // }

    // const _objectId = new Types.ObjectId();

    // // fill in any default fields required here
    // const recordDto: ObjectRecordDto = Object.assign(new recordClass(), {
    //   ...dto,
    //   _id: _objectId.toString(),
    //   id: `${actorId}/${dto.type && typeof dto.type === 'string' ? dto.type.toLowerCase() : 'object'}/${_objectId.toString()}`,
    //   _serviceId: dto.serviceId,
    //   attributedTo: actorId,
    //   _public: Array.isArray(dto.to)? dto.to.includes('https://www.w3.org/ns/activitystreams#Public') : dto.to === 'https://www.w3.org/ns/activitystreams#Public',
    //   published: new Date().toISOString()
    // });

    // this.logger.debug(`Creating Object with id ${recordDto.id}`);

    // // model = this[`${model}Model`] as (Model<ObjectDocument | RelationshipDocument>);

    // // const object = await this.objectModel.create(recordDto);
    // // const object = await this.relationshipModel.create(recordDto);
    // const object = await create(recordDto);

    // return {
    //   object: plainToInstance(ObjectRecordDto, object, {excludeExtraneousValues: true, exposeUnsetFields: false}),
    //   record: object
    // }
  }

  protected applyDefaultParams(dto: ObjectDto) {

  }

  public async createRelationship(dto: RelationshipRecordDto): Promise<RelationshipDocument> {
    return this.relationshipModel.create(dto);
  }

  public async createObject(dto: ObjectRecordDto) {
    return this.objectModel.create(dto);
  }

  /**
   * Create an Actor object.  The Actor is a first class object in ActivityPub, and is used to represent a user or service.
   */
  public async createActor(actorDto: ObjectRecordDto) {
    this.logger.debug(`Creating Actor with id ${actorDto.id}`);
    const record = await this.objectModel.create(actorDto);

    return {record};
  }

  public async findById(id: string | Schema.Types.ObjectId): Promise<any> {
    return this.objectModel.findById(id);
  }

  public async find(params: any = {}, options: any = {}): Promise<any> {
    return this.objectModel.find(params, {}, options);
  }

  public async findOne(params: any): Promise<ObjectDocument | null> {
    return this.objectModel.findOne(params);
  }

  public async getUserOutbox(userId: string): Promise<any> {
    return this.objectModel.find({attributedTo: userId});
  }
}
