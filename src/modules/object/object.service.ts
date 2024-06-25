import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectDocument, ObjectRecord } from './schema/object.schema';
import mongoose, { Model, Types, Schema } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { ObjectDto } from './dto/object.dto';
import { RelationshipDocument, RelationshipRecord } from './schema/relationship.schema';
import { ConfigService } from '@nestjs/config';
import { resolveDomain } from '../../common/decorators/service-domain.decorator';
import { RelationshipType } from './type/relationship.type';
import { ObjectType } from './type/object.type';
import { ASObject, ASObjectOrLink, Link } from '@yuforium/activity-streams';
import { StoredObjectResolver } from './resolver/stored-object.resolver';
import { ActorDocument } from './schema/actor.schema';
import { ActorDto } from './dto/actor/actor.dto';
import { Attribution } from './type/attribution.type';
import { BaseObjectType } from './type/base-object.type';
import { BaseObjectMetadataType } from './schema/base-object.schema';
import { ActorType } from './type/actor.type';

type ResolvableFields = 'attributedTo' | 'to' | 'cc' | 'bcc' | 'audience';

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
   * Note that this method will replace the fields in the object itself with the resolved values if they resolve.
   * @todo - The ActivityStreams library currently handles resolution at the item level (e.g. items resolve themselves, and then return their
   * resolved value when requested or converted.  This may not be the most ideal pattern, so this function will do the replacement of the
   * fields in the object itself.
   */
  public async resolveFields(item: ASObject, fields: ResolvableFields | ResolvableFields[]): Promise<any> {
    fields = Array.isArray(fields) ? fields : [fields];

    return await Promise.all(fields.map(async (field) => {
      const value = item[field];
      let resolved;

      if (Array.isArray(value)) {
        resolved = await Promise.all(value.map(async (v) => this.resolve(v)));
      }
      else if (value) {
        resolved = await this.resolve(value);
      }

      if (resolved) {
        item[field] = resolved;
      }

      return resolved;
    }));
  }

  /**
   * Resolve a link or string to an object.
   */
  public async resolve(value: ASObjectOrLink | string): Promise<ASObjectOrLink> {
    if (typeof value === 'string') {
      value = new Link(value);
    }

    // @todo the AS library should expose a method to determine if an object is a link.
    // potentially a `resolve` method in the library would be useful too
    if ((value as any)._asmeta?.baseType ===  'link') {
      const val = await (value as Link).resolve(this.resolver);
      return val;
    }

    return value;
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
   * Check to see if an object is not null, handling TypeScript type guards.
   */
  protected isNotNull<T>(obj: T | null): obj is T {
    return obj !== null;
  }

  /**
   * Get all metadata for an object.  Metadata is stored in the database and used to assist in making queries,
   * and should be able to be reconstructed from a base activity streams object.
   * @param dto
   * @returns
   */
  public async getBaseObjectMetadata(dto: ObjectType): Promise<BaseObjectMetadataType> {
    const url = new URL(dto.id);
    const _domain = resolveDomain(url.hostname);
    const _public = this.isPublic(dto);
    const _local = this.isLocal(dto);

    const lookup = async (fields: ASObjectOrLink | ASObjectOrLink[] | undefined): Promise<(ObjectDocument | ActorDocument)[]> => {
      if (!fields) {
        return [];
      }

      const ids = (Array.isArray(fields) ? fields : (fields ? [fields] : []))
        .map(i => typeof i === 'object' ? i.id : i)
        .filter(i => i !== undefined ? true : false) as string[];

      return Promise.all(ids.map(id => this.objectModel.findOne({id: {$eq: id}, _local: true})))
        .then(results => results.filter(this.isNotNull));
    }

    const _attribution: Attribution[] = [];

    await Promise.all([lookup(dto.to), lookup(dto.cc), lookup(dto.bcc), lookup(dto.attributedTo), lookup(dto.audience)])
      .then(results => {
        const [to, cc, bcc, attributedTo, audience] = results;
        to.forEach(obj => _attribution.push({rel: 'to', _id: obj._id, id: obj.id}));
        cc.forEach(obj => _attribution.push({rel: 'cc', _id: obj._id, id: obj.id}));
        bcc.forEach(obj => _attribution.push({rel: 'bcc', _id: obj._id, id: obj.id}));
        attributedTo.forEach(obj => _attribution.push({rel: 'attributedTo', _id: obj._id, id: obj.id}));
        audience.forEach(obj => _attribution.push({rel: 'audience', _id: obj._id, id: obj.id}));
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
  public async assignObjectMetadata<T extends ObjectType = ObjectType>(dto: T): Promise<T & BaseObjectType> {
    const metadata = await this.getBaseObjectMetadata(dto);
    return Object.assign(dto, metadata);
  }

  /**
   * Rebuild an object's metadata.  This does not save the object.
   * @param dto
   */
  public async rebuildMetadata<T extends ObjectType = ObjectType>(dto: T): Promise<T & BaseObjectType> {
    const metadata = await this.getBaseObjectMetadata(dto);
    return Object.assign(dto, metadata);
  }

  /**
   * Rebuild an object's metadata and save the object.
   * @param id The object's ID
   * @returns The (repaired) object record
   */
  public async repairMetadata(id: string): Promise<BaseObjectType> {
    const obj = await this.objectModel.findOne({ id });

    if (!obj) {
      throw new NotFoundException(`Object not found: ${id}`);
    }

    await this.rebuildMetadata(obj);
    await obj.save();

    return obj;
  }

  protected async getParentIds(dto: ObjectType, thread: string[]): Promise<string[]> {
    if (dto.inReplyTo) {
      const id = typeof dto.inReplyTo === 'string' ?
        dto.inReplyTo : dto.inReplyTo instanceof Link ? dto.inReplyTo.href : dto.inReplyTo.id;
      const parent = await this.findById(id as string);
      if (parent) {
        thread.push(parent.id.toString());
        thread = await this.getParentIds(parent, thread);
      }
      else {
        // @todo do nothing for now, but it may be possible in a federated model that a parent object is not in the database.
      }
    }
    return thread;
  }

  /**
   * @todo consider moving this into a separate content service
   */
  public async createContent<T extends ObjectType = ObjectType>(dto: T): Promise<ObjectType> {
    const record = Object.assign({}, dto, this.getBaseObjectMetadata(dto), {
      _replies: {
        default: {
          count: 0
        }
      }
    });

    const parents = await this.getParentIds(dto, []);

    const doc = await this.objectModel.create(record);
    await this.objectModel.updateMany({id: {$in: parents}}, {$inc: {'_replies.default.count': 1}, '_replies.default.last': Math.floor(new Date(doc.published as string).getTime())});

    return this.docToInstance(doc);
  }

  /**
   * Create a new object record.
   */
  public async create<T extends BaseObjectType = BaseObjectType>(dto: T): Promise<BaseObjectType> {
    try {
      const record = Object.assign({}, dto, this.getBaseObjectMetadata(dto));
      const doc = await this.objectModel.create(record);
      return this.docToInstance(doc);
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
  public async findById(id: string): Promise<ObjectDocument | null> {
    return this.objectModel.findOne({id});
  }

  /**
   * Find an object by its internal ID (MongoDB ObjectId).
   * @todo there should be a BaseObject type that T extends
   */
  public async findByInternalId<T extends mongoose.Document>(id: string | Schema.Types.ObjectId): Promise<T | null> {
    return this.objectModel.findById(id);
  }

  public async find(params: any = {}, options: any = {}): Promise<ObjectDocument[]> {
    this.logger.debug(`find(): params: ${JSON.stringify(params)}`);
    return this.objectModel.find(params, {}, options);
  }

  /**
   * Convert a Mongoose doc to DTO instance
   */
  public docToInstance(doc: ObjectType): BaseObjectType {
    const type = Array.isArray(doc.type) ? doc.type : [doc.type];
    const opts = {excludeExtraneousValues: true, exposeUnsetFields: false};

    if (['Forum', 'Person'].some(i => type.includes(i))) {
      const i = plainToInstance(ActorDto, doc, opts);
      return i;
    }

    return plainToInstance(ObjectDto, doc, opts);
  }

  /**
   * Consider splitting this off into a content service or something similar.
   */
  public async findPageWithTotal(params: any = {}, options: {skip: number, limit: number, sort?: string} = {skip: 0, limit: 10}): Promise<{totalItems: number, data: ObjectRecord[]}> {
    const facet = {$facet: {metadata: [{$count: 'total'}], data: [{ $skip: options.skip }, { $limit: options.limit }]}};
    const result = await this.objectModel.aggregate([{$match: params}, {$sort: {published: -1}}, facet], options);
    const data = result[0].data.map((doc: any) => {
      doc.replies = {
        type: 'Collection',
        totalItems: doc._replies?.default?.count || 0,
      }
      return this.docToInstance(doc);
    });
    return {totalItems: result[0].metadata[0]?.total || 0, data};
  }

  public async findOne(params: any): Promise<BaseObjectType | null> {
    const obj = await this.objectModel.findOne(params);
    if (obj) {
      return this.docToInstance(obj);
    }
    return obj;
  }

  public async getUserOutbox(userId: string): Promise<any> {
    return this.objectModel.find({ attributedTo: userId });
  }
}
