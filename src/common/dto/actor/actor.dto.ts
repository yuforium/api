import { Prop } from '@nestjs/mongoose';
import { ActivityStreams } from '@yuforium/activity-streams';
import { Schema } from 'mongoose';

/**
 * Yuforium's base Actor type diverges from its base Object type in that it 
 * adds a preferredusername field and helper methods to for values such as 
 * inbox and outbox.  Multiple types are also supported.
 * 
 * Usage of the @Prop decorator is required for Mongoose to properly save 
 * an Activity Streams field into the database.  Any AS field that is not 
 * decordated with @Prop will not be saved (note the absence of the `to` 
 * field below).
 */
export class ActorDto extends ActivityStreams.object('Actor') {
  @Prop({type: Schema.Types.Mixed, required: true})
  public type!: string | string[];

  @Prop({type: String, required: true})
  public name!: string;

  @Prop({type: String, required: false})
  public summary?: string;

  @Prop({type: String, required: true})
  public preferredUsername!: string;

  @Prop({type: String, required: true})
  public id!: string;

  @Prop({type: Schema.Types.Mixed, required: false})
  public publicKey!: {id: string, owner: string, publicKeyPem: string};
}