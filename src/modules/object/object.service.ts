import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { ObjectDocument, ObjectRecord } from './schema/object.schema';
import { Model, Types, Schema, Connection } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { ObjectDto } from '../../common/dto/object/object.dto';
import { RelationshipDocument, RelationshipRecord } from './schema/relationship.schema';
import { ConfigService } from '@nestjs/config';
import { Attribution, BaseObjectRecord } from './schema/base-object.schema';
import { resolveDomain } from '../../common/decorators/service-domain.decorator';
import { RelationshipType } from './type/relationship.type';
import { ObjectType } from './type/object.type';
import { ASObjectOrLink, Link, ResolvableArray } from '@yuforium/activity-streams';
import { StoredObjectResolver } from './resolver/stored-object.resolver';
import { ActivityStreams } from '@yuforium/activity-streams';

type Resolvable = 'attributedTo' | 'to' | 'cc' | 'bcc';

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
    protected configService: ConfigService,
    @Inject(forwardRef(() => StoredObjectResolver)) protected readonly resolver: StoredObjectResolver
  ) { }

  public async get(id: string): Promise<ObjectDocument | null> {
    return this.objectModel.findOne({ id });
  }

  public async getByPath(_serviceId: string, _servicePath: string, _servicePathId: string) {
    return this.objectModel.findOne({ _serviceId, _servicePath, _servicePathId });
  }

  /**
   * Convenience method for generating a new Object ID.
   */
  public id() {
    return new Types.ObjectId();
  }

  /**
   * Resolve the fields of an object.
   * @todo This uses the @yuforium/activity-streams resolver to resolve links.  The activity-streams library
   * does not currently support resolving arrays of links, but should be able to in the future (by providing
   * a ResolvableArray class for arrays that would resolve each item).
   */
  public async resolveFields(item: ObjectDto | ObjectDto[], fields: Resolvable | Resolvable[]): Promise<any> {
    if (Array.isArray(item)) {
      return Promise.all(item.map(i => this.resolveFields(i, fields)));
    }

    fields = Array.isArray(fields) ? fields : [fields];

    return Promise.all(fields.map(field => {
      const value = item[field];
      if (value instanceof Link || value instanceof ResolvableArray) {
        return value.resolve(this.resolver);
      }
      return Promise.resolve(value);
    }));

    // return item;



    // const resolveUsers = items
    //   .map((i: ObjectDto) => {
    //     if (i.attributedTo instanceof Link) {
    //       return i.attributedTo.resolve(this.resolver);
    //     }
    //     else {
    //       return Promise.resolve(i.attributedTo);
    //     }
    //   });

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

    const lookup = async (fields: ASObjectOrLink | ASObjectOrLink[] | undefined): Promise<(ObjectDocument)[]> => {
      if (!fields) {
        return [];
      }

      const ids = (Array.isArray(fields) ? fields : (fields ? [fields] : []))
        .map(i => typeof i === 'object' ? i.id : i)
        .filter(i => i !== undefined ? true : false) as string[];

      return Promise.all(ids.map(id => this.findOne({id, _local: true})))
        .then(results => results.filter(o => o !== null) as ObjectDocument[]);
    }

    const _attribution: Attribution[] = [];

    await Promise.all([lookup(dto.to), lookup(dto.cc), lookup(dto.bcc), lookup(dto.attributedTo)])
      .then(results => {
        const [to, cc, bcc, attributedTo] = results;
        to.forEach(obj => _attribution.push({rel: 'to', _id: obj._id, id: obj.id}));
        cc.forEach(obj => _attribution.push({rel: 'cc', _id: obj._id, id: obj.id}));
        bcc.forEach(obj => _attribution.push({rel: 'bcc', _id: obj._id, id: obj.id}));
        attributedTo.forEach(obj => _attribution.push({rel: 'attributedTo', _id: obj._id, id: obj.id}));
      });

    return {
      _attribution,
      _domain,
      _public,
      _local
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

  /**
   * Create a new object record.
   */
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

  /**
   * Find an object by its Activity Streams ID.  Note that this is different from the internal ID (MongoDB ObjectId).
   */
  public async findById(id: string | Schema.Types.ObjectId): Promise<any> {
    return this.objectModel.findOne({id});
  }

  /**
   * Find an object by its internal ID (MongoDB ObjectId).
   */
  public async findByInternalId(id: string | Schema.Types.ObjectId): Promise<ObjectDocument | null> {
    return this.objectModel.findById(id);
  }

  public async find(params: any = {}, options: any = {}): Promise<ObjectDocument[]> {
    this.logger.debug(`find(): params: ${JSON.stringify(params)}`);
    return this.objectModel.find(params, {}, options);
  }

  /**
   * Consider splitting this off into a content service or something similar.
   */
  public async findPageWithTotal(params: any = {}, options: {skip: number, limit: number, sort?: string} = {skip: 0, limit: 10}): Promise<{totalItems: number, data: ObjectDocument[]}> {
    const facet = {$facet: {metadata: [{$count: 'total'}], data: [{ $skip: options.skip }, { $limit: options.limit }]}};
    const result = await this.objectModel.aggregate([{$match: params}, {$sort: {published: -1}}, facet], options);
    return {totalItems: result[0].metadata[0]?.total || 0, data: result[0].data}
  }

  public async findOne(params: any): Promise<ObjectDocument | null> {
    return this.objectModel.findOne(params);
  }

  public async getUserOutbox(userId: string): Promise<any> {
    return this.objectModel.find({ attributedTo: userId });
  }
}
