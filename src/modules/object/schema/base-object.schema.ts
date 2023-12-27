import { Prop } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Types } from 'mongoose';
import { BaseRecord, BaseSchema, GConstructor } from '../../../common/schema/base.schema';
import { ASObject } from '@yuforium/activity-streams';

/**
 * Mixin type that defines common fields that are used for all stored objects.
 */
type BaseObjectRecord = BaseRecord & {
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
export function BaseObjectSchema<TBase extends GConstructor<ASObject & {id: string}>>(Base: TBase): TBase & GConstructor<BaseObjectRecord> {
  class BaseObjectSchema extends BaseSchema<TBase>(Base) implements BaseObjectRecord {
    /**
     * Specifies an actor or list of actors for where the object was received 
     * via the inbox. (local actors only)
     *  
     * This is based on the to/cc/bcc field.
     * 
     * @todo this can be expanded upon.  Instead of a simple actor reference,
     * we can store more descriptive information about the recipient, such as 
     * the to/cc/bcc field, and the actor's role in the message.  For example:
     * 
     * ```json
     * [
     *  {rel: "self", actor: "https://example.com/actors/1", _id: "<mongo object id>"},
     *  {rel: "to", actor: "https://example.com/actors/2", _id: "<mongo object id>"},
     * ]
     * ```
     */
    @Prop({type: [Types.ObjectId], required: true})
    @Exclude()
    public _inbox?: Types.ObjectId[] = [];

    /**
     * Actor who created the object.  This is used to determine the outbox from 
     * which the object originated.
     */
    @Prop({type: [Types.ObjectId], required: false})
    @Exclude()
    public _outbox?: Types.ObjectId;

    /**
     * Essentially, a combined _inbox and _outbox, attribution is used for querying content, only 
     * differs from _inbox because it includes the _outbox or IDs of any *local* actor whose feed
     * might contain this object.
     */
    @Prop({type: [Types.ObjectId], required: true})
    @Exclude()
    public _attribution: Types.ObjectId[] = [];
  }

  return BaseObjectSchema;
}
