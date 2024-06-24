import { Prop } from '@nestjs/mongoose';
import { Exclude, Expose } from 'class-transformer';
import { Schema, Types } from 'mongoose';
import { BaseRecord, BaseSchema, GConstructor } from '../../../common/schema/base.schema';
import { ASObject } from '@yuforium/activity-streams';
import { Attribution } from '../type/attribution.type';
import { BaseObjectType } from '../type/base-object.type';

/**
 * Mixin type that defines common fields that are used for all stored objects.
 */
export type BaseObjectMetadataType = {
  _id: string | Types.ObjectId;
  _domain: string;
  _local: boolean;
  _public: boolean;
  _deleted?: boolean;

  /**
   * Only used for local actors, specifies the outbox from which the object originated.
   */
  // _attribution?: Attribution[];
}

export function baseObjectRecord<T extends GConstructor<BaseObjectType> = GConstructor<BaseObjectType>>(Base: T): T & GConstructor<BaseObjectMetadataType> {
  class Record extends Base {
    /**
     * The ID of the object, override @Prop to force requirements + uniqueness.
     */
    @Prop({type: String, required: true, unique: true})
    @Expose()
    public id!: string;

    /**
     * The database ID of the object.
     */
    @Exclude()
    public _id!: Types.ObjectId;

    /**
     * The domain of the object.  This is used for querying content.  Although
     * there is no support for multiple domains, this is included for future support.
     */
    @Prop({type: String, required: true})
    @Exclude()
    public _domain!: string;

    /**
     * Specifies if this is a local object.
     */
    @Prop({type: Boolean, required: true})
    @Exclude()
    public _local!: boolean;

    /**
     * Specifies if this is a public object.  Used for querying content.
     */
    @Prop({type: Boolean, default: false})
    @Exclude()
    public _public!: boolean;

    /**
     * Specifies if this is a deleted object.  This is used for querying content.
     */
    @Prop({type: Boolean, required: false, default: false})
    @Exclude()
    public _deleted?: boolean;

    // _attribution?: Attribution[];
  }

  return Record;
}

/**
 * Mixin type that defines common fields that are used for all stored objects.
 * @todo consider renaming this type to `BaseObjectMetadata` or `BaseObjectFields`
 * @deprecated Use `BaseObjectMetadataType` instead.
 */
export type BaseObjectRecord = BaseRecord & {
  /**
   * Only used for local actors, specifies the outbox from which the object originated.
   */
  _attribution?: Attribution[];
}

/**
 * This is a mixin that defines common fields that are used for all stored
 * objects.  These are metadata fields that are used to for storage and
 * querying only, and should be excluded from the API response.
 *
 * It should be possible to reconstruct any of these fields if necessary.
 *
 * @param Base
 * @returns GConstructor<BaseObjectRecord & ObjectDto>
 * @deprecated Use `baseObjectRecord` instead.
 */
export function BaseObjectSchema<TBase extends GConstructor<ASObject & {id: string}>>(Base: TBase): TBase & GConstructor<BaseObjectRecord> {
  class BaseObjectSchema extends BaseSchema<TBase>(Base) {
    public _id!: Types.ObjectId;
    /**
     * Specifies an actor or list of actors for where the object was received
     * via the inbox or sent via outbox. It also includes tertiary actors that
     * are not directly related to the object, but are included for querying,
     * such as the audience or context field.
     */
    @Prop({type: Schema.Types.Array, required: false})
    @Exclude()
    public _attribution?: Attribution[];

    @Prop({type: Schema.Types.Mixed, required: false})
    @Exclude()
    public _replies?: {moderator?: number, normal?: number};
  }

  return BaseObjectSchema;
}
