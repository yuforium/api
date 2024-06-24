import { Prop } from '@nestjs/mongoose';
import { Exclude, Expose } from 'class-transformer';
import { Schema, Types } from 'mongoose';
import { GConstructor } from '../../../common/schema/base.schema';
import { BaseObjectDto } from '../dto/base-object.dto';
import { Attribution } from '../type/attribution.type';
import { BaseObjectType } from '../type/base-object.type';

export type BaseObjectDocument = BaseObjectRecord & Document;

/**
 * Mixin type that defines common fields that are used for all stored objects.
 */
export type BaseObjectMetadataType = {
  _domain: string;
  _local: boolean;
  _public: boolean;
  _deleted?: boolean;

  /**
   * Only used for local actors, specifies the outbox from which the object originated.
   */
  _attribution?: Attribution[];
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

    @Prop({type: Schema.Types.Mixed, required: false})
    @Exclude()
    public _attribution?: Attribution[];
  }

  return Record;
}

export class BaseObjectRecord extends baseObjectRecord(BaseObjectDto) { }
