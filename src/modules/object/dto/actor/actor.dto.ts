import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsAlphanumeric, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Schema } from 'mongoose';
import { BaseObjectDto } from '../base-object.dto';

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
export class ActorDto extends BaseObjectDto {
  @ApiProperty({
    oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}],
    description: 'The context of the actor, multiple supported'
  })
  @Expose()
  @Prop({type: Schema.Types.Mixed, required: true})
  public '@context': string | string[] = 'https://www.w3.org/ns/activitystreams';

  @ApiProperty({
    oneOf: [{type: 'string'}, {type: 'array', items: {type: 'string'}}],
    description: 'The type of the actor, multiple supported'
  })
  @Expose()
  @Prop({type: Schema.Types.Mixed, required: true})
  public type!: string | string[];

  @ApiProperty({type: 'string', description: 'The name of the actor'})
  @Expose()
  @Prop({type: String, required: true})
  public name!: string;

  @ApiProperty({type: 'string', description: 'A descriptive summary of the actor'})
  @Expose()
  @Prop({type: String, required: false})
  public summary?: string;

  @ApiProperty({type: 'string', description: 'The preferred username of the actor, used in mentions and other places'})
  @Expose()
  @Prop({type: String, required: true})
  @IsNotEmpty()
  @IsString()
  @IsAlphanumeric()
  @MinLength(5)
  @MaxLength(64)
  public preferredUsername!: string;

  @Expose()
  @ApiProperty({type: 'string', description: 'The ID of the actor'})
  @Prop({type: String, required: true})
  public id!: string;

  @Expose()
  @Prop({type: Schema.Types.Mixed, required: false})
  public publicKey!: {id: string, owner: string, publicKeyPem: string};

  @Expose({toPlainOnly: true})
  public get inbox(): string {
    return `${this.id}/inbox`;
  }

  @Expose({toPlainOnly: true})
  public get outbox(): string {
    return `${this.id}/outbox`;
  }

  @Expose({toPlainOnly: true})
  public get followers(): string {
    return `${this.id}/followers`;
  }

  @Expose({toPlainOnly: true})
  public get following(): string {
    return `${this.id}/following`;
  }
}
