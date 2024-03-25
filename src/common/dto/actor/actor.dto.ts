import { Prop } from '@nestjs/mongoose';
import { ActivityStreams } from '@yuforium/activity-streams';
import { Expose } from 'class-transformer';
import { IsAlphanumeric, IsNotEmpty, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
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
  @Expose()
  @Prop({type: Schema.Types.Mixed, required: true})
  public '@context': string | string[] = 'https://www.w3.org/ns/activitystreams';

  @Expose()
  @Prop({type: Schema.Types.Mixed, required: true})
  public type!: string;

  @Expose()
  @Prop({type: String, required: true})
  public name!: string;

  @Expose()
  @Prop({type: String, required: false})
  public summary?: string;

  @Expose()
  @Prop({type: String, required: true})
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MinLength(5)
  @MaxLength(64)
  public preferredUsername!: string;

  @Prop({type: String, required: true})
  public id!: string;

  @Expose()
  @Prop({type: Schema.Types.Mixed, required: false})
  public publicKey!: {id: string, owner: string, publicKeyPem: string};
}
