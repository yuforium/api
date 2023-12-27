import { Prop } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Types } from 'mongoose';

export type GConstructor<T = object> = new (...args: any[]) => T;

/**
 * Minimum type requirements to store a record.
 */
export type BaseDto = {
  id: string;
}

/**
 * Mixin type that defines common fields that are used for all stored records.
 */
export type BaseRecord = {
  _id?: string | Types.ObjectId;
  _domain: string;
  _public: boolean;
  _local: boolean;
  _deleted?: boolean;
}

export function BaseSchema<SourceDtoType extends GConstructor<BaseDto> = GConstructor<BaseDto>>(SourceDto: SourceDtoType): SourceDtoType & GConstructor<BaseRecord> {
  class BaseSchema extends SourceDto implements BaseRecord {
    /**
     * The ID of the object, override @Prop to force requirements + uniqueness.
     */
    @Prop({type: String, required: true, unique: true})
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
     * Specifies if this is a public object.  Used for querying content.
     */
    @Prop({type: Boolean, default: false})
    @Exclude()
    public _public!: boolean;

    /**
     * Specifies if this is a local object.
     */
    @Prop({type: Boolean, required: true})
    @Exclude()
    public _local: boolean = false;

    /**
     * Specifies if this is a deleted object.  This is used for querying content.
     */
    @Prop({type: Boolean, required: false, default: false})
    public _deleted?: boolean;
  }

  return BaseSchema;
}
