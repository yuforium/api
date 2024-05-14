import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectDocument, ObjectRecord } from './schema/object.schema';
import { Model, Types, Schema, Connection } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { ObjectDto } from '../../common/dto/object/object.dto';
import { RelationshipDocument, RelationshipRecord } from './schema/relationship.schema';
import { ConfigService } from '@nestjs/config';
import { BaseObjectRecord, Destination, Origination } from './schema/base-object.schema';
import { resolveDomain } from '../../common/decorators/service-domain.decorator';
import { RelationshipType } from './type/relationship.type';
import { ObjectType } from './type/object.type';


/**
 * Object Service
 * The purpose of the Object Service is to provide a common interface for interacting with Object records.
 *
 * @todo - Design considerations:
 * ObjectRecordService vs ObjectService
 * Anything that would interact with the DB and be provided solely for managing DB records could be considered the ObjectRecordService.
 * ObjectService *could* return or transform the DB records into class instances, thus providing helper methods for interacting with the records.
 */
@Injectable()
export class ObjectService {
  protected readonly logger = new Logger(ObjectService.name);

  constructor(
    @InjectModel(ObjectRecord.name) protected objectModel: Model<ObjectDocument>,
    @InjectModel(RelationshipRecord.name) protected relationshipModel: Model<RelationshipDocument>,
    @InjectConnection() protected connection: Connection,
    protected configService: ConfigService
  ) { }

  public async get(id: string): Promise<ObjectDocument | null> {
    return this.objectModel.findOne({ id });
  }

  public async getByPath(_serviceId: string, _servicePath: string, _servicePathId: string) {
    return this.objectModel.findOne({ _serviceId, _servicePath, _servicePathId });
  }

  public id() {
    return new Types.ObjectId();
  }

  /**
   * Check to see if an object is public (readable by anyone and without authentication).
   */
  protected isPublic(obj: ObjectType): boolean {
    const pub = 'https://www.w3.org/ns/activitystreams#Public';

    if (!obj.to) {
      return false;
    }

    const isPublic =
      obj.to === pub || (Array.isArray(obj.to) && obj.to.includes(pub)) ||
      obj.cc === pub || (Array.isArray(obj.cc) && obj.cc.includes(pub)) ||
      obj.bcc === pub || (Array.isArray(obj.bcc) && obj.bcc.includes(pub));

    return isPublic;
  }

  protected isLocal(obj: ObjectType): boolean {
    const local = this.configService.get('service.defaultDomain');
    const url = new URL(obj.id);
    const domain = resolveDomain(url.hostname);

    return domain === local || domain === 'localhost';
  }

  /**
   * Get all metadata for an object.  Metadata is stored in the database and used to assist in making queries, and should be able to be reconstructed from the object.
   * @param dto
   * @returns
   */
  public async getObjectMetadata(dto: ObjectType): Promise<BaseObjectRecord> {
    const url = new URL(dto.id);
    const _domain = resolveDomain(url.hostname);
    const _public = this.isPublic(dto);
    const _local = this.isLocal(dto);

    const destinations = [];

    if (dto.to) {
      destinations.push(...(Array.isArray(dto.to) ? dto.to : [dto.to]));
    }
    if (dto.bcc) {
      destinations.push(...(Array.isArray(dto.bcc) ? dto.bcc : [dto.bcc]));
    }
    if (dto.cc) {
      destinations.push(...(Array.isArray(dto.cc) ? dto.cc : [dto.cc]));
    }

    const attributedTo = Array.isArray(dto.attributedTo) ? dto.attributedTo : typeof dto.attributedTo === 'string' ? [dto.attributedTo] : [];

    const _destination: Destination[] = (await Promise.all(destinations.map(dest => this.findOne({ id: dest, _local: true }))))
      .filter(o => o !== null)
      .map((o: any): Destination => ({ rel: 'inbox', _id: o._id as Types.ObjectId }));

    const _origination: Origination[] = (await Promise.all(attributedTo.map(t => this.findOne({ id: t, _local: true }))))
      .filter(o => o !== null)
      // @todo attribution needs to be figured out - self is going to be the last entry in the attributedTo array
      .map((o: any): Origination => ({ rel: 'self', _id: o._id as Types.ObjectId }));

    return {
      _domain,
      _public,
      _local,
      _origination,
      _destination
    };
  }

  /**
   * Assign metadata to an object.
   * @param dto
   * @returns
   */
  public async assignObjectMetadata<T extends ObjectType = ObjectType>(dto: T): Promise<T & BaseObjectRecord> {
    const metadata: BaseObjectRecord = await this.getObjectMetadata(dto);
    return Object.assign(dto, metadata);
  }

  /**
   * Rebuild an object's metadata.  This does not save the object.
   * @param dto
   */
  public async rebuildMetadata<T extends ObjectType = ObjectType>(dto: T): Promise<T & BaseObjectRecord> {
    const metadata: BaseObjectRecord = await this.getObjectMetadata(dto);
    return Object.assign(dto, metadata);
  }

  /**
   * Rebuild an object's metadata and save the object.
   * @param id The object's ID
   * @returns The (repaired) object record
   */
  public async repairMetadata(id: string): Promise<BaseObjectRecord> {
    const obj = await this.objectModel.findOne({ id });

    if (!obj) {
      throw new NotFoundException(`Object not found: ${id}`);
    }

    await this.rebuildMetadata(obj);
    await obj.save();

    return obj;
  }

  public async create(dto: ObjectRecord): Promise<ObjectDto> {
    try {
      const obj = await this.objectModel.create(dto);
      return plainToInstance(ObjectDto, obj);
    }
    catch (err) {
      this.logger.error(`create(): ${(err as Error).message}`);
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

  protected applyDefaultParams() {
  }

  public async createRelationship(dto: RelationshipType): Promise<RelationshipDocument> {
    return this.relationshipModel.create(dto);
  }

  public async createObject(dto: ObjectRecord) {
    return this.objectModel.create(dto);
  }

  /**
   * Create an Actor object.  The Actor is a first class object in ActivityPub, and is used to represent a user or service.
   */
  public async createActor(actorDto: ObjectRecord) {
    this.logger.debug(`Creating Actor with id ${actorDto.id}`);
    const record = await this.objectModel.create(actorDto);

    return { record };
  }

  public async findById(id: string | Schema.Types.ObjectId): Promise<any> {
    return this.objectModel.findById(id);
  }

  public async find(params: any = {}, options: any = {}): Promise<ObjectDocument[]> {
    this.logger.debug(`find(): params: ${JSON.stringify(params)}`);
    return this.objectModel.find(params, {}, options);
  }

  public async findOne(params: any): Promise<ObjectDocument | null> {
    return this.objectModel.findOne(params);
  }

  public async getUserOutbox(userId: string): Promise<any> {
    return this.objectModel.find({ attributedTo: userId });
  }
}
