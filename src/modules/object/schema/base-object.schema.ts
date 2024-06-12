import { Prop } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Schema, Types } from 'mongoose';
import { BaseRecord, BaseSchema, GConstructor } from '../../../common/schema/base.schema';
import { ASObject } from '@yuforium/activity-streams';

export type Destination = {
  rel: 'inbox' | 'outbox' | 'followers' | 'following';
  _id: Types.ObjectId;
  description?: string;
};

export type Origination = {
  rel: 'self' | 'attribution';
  _id: Types.ObjectId;
  description?: string;
}

export type Attribution = {
  /**
   * Type of relationship between the object and the actor.
   */
  rel: 'attributedTo' | 'to' | 'cc' | 'bcc';

  /**
   * The internal Object ID for the actor that is attributed to the object.
   */
  _id: Types.ObjectId;

  id: string;
  description?: string;
  primary?: boolean;
}

/**
 * Mixin type that defines common fields that are used for all stored objects.
 * @todo consider renaming this type to `BaseObjectMetadata` or `BaseObjectFields`
 */
export type BaseObjectRecord = BaseRecord & {
  /**
   * Only used for local actors, specifies the outbox from which the object originated.
   */
  // _origination: Origination[];
  // _destination: Destination[];
  _attribution: Attribution[];
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
  class BaseObjectSchema extends BaseSchema<TBase>(Base) {
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
    // @Prop({type: Schema.Types.Mixed, required: true})
    // @Exclude()
    // public _destination: Destination[] = [];

    /**
     * Actor who created the object.  This is used to determine the outbox from
     * which the object originated.
     */
    // @Prop({type: Schema.Types.Mixed, required: false})
    // @Exclude()
    // public _origination: Origination[] = [];

    @Prop({type: Schema.Types.Array, required: false})
    @Exclude()
    public _attribution: Attribution[] = [];

    @Prop({type: Schema.Types.Mixed, required: false})
    @Exclude()
    public _replies: {moderator?: number, normal?: number} = {}
  }

  return BaseObjectSchema;
}
