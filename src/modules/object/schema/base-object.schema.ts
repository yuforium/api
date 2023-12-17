import { Prop } from "@nestjs/mongoose";
import { Exclude, Transform } from "class-transformer";
import { ObjectDto } from "src/common/dto/object/object.dto";
import { Types } from "mongoose";

export type GConstructor<T = {}> = new (...args: any[]) => T

type BaseObjectRecord = {
  _id?: string | Types.ObjectId;
  _domain: string;
  _public: boolean;
  _local: boolean;
  _inbox?: Types.ObjectId[];
  _outbox?: Types.ObjectId;
  _destination?: Types.ObjectId[];
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
 */
export function BaseObjectSchema<TBase extends GConstructor<ObjectDto>>(Base: TBase): TBase & GConstructor<BaseObjectRecord>{
  class BaseObjectSchema extends Base implements BaseObjectRecord {
    /**
     * The database ID of the object.
     */
    @Exclude()
    public _id!: Types.ObjectId;

    /**
     * The domain of the object.  This is used for querying content.
     */
    @Prop({type: String, required: true})
    @Exclude()
    public _domain!: string;

    /**
     * Specifies an actor or list of actors for where the object was received 
     * via the inbox. (local actors only)
     *  
     * This is based on the to/cc/bcc field. 
     */
    @Prop({type: [Types.ObjectId], required: true})
    @Exclude()
    public _inbox?: Types.ObjectId[] = [];

    /**
     * Actor who created the object.  This is used to determine the outbox from 
     * which the object originated.
     */
    @Prop({type: Types.ObjectId, required: false})
    @Exclude()
    public _outbox?: Types.ObjectId;

    /**
     * Combined _inbox and _outbox.  This is used for querying content, only 
     * differs from _inbox because it includes the _outbox.
     */
    @Prop({type: [Types.ObjectId], required: true})
    @Exclude()
    public _destination: Types.ObjectId[] = [];

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
    public _local!: boolean;
  }

  return BaseObjectSchema;
}