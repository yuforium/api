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
  rel: 'attributedTo' | 'to' | 'cc' | 'bcc' | 'audience' | 'context';

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
