import { Prop } from '@nestjs/mongoose';
import { ApiExtraModels, ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ActivityStreams, Link } from '@yuforium/activity-streams';
import { Expose } from 'class-transformer';
import * as mongoose from 'mongoose';

const { Mixed } = mongoose.Schema.Types;

/**
 * Helper object for defining a property that may be a string or array of strings
 */
const ApiPropertyOneOfStringOrArray = {
  required: false,
  oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
};

/**
 * ObjectDto
 * The Object DTO extends the ActivityStreams base object type and adds
 * decorators for Mongoose and any custom validation overrides, including
 * what fields are exposed on a response (@Expose()) and OpenAPI response
 * decorators.
 *
 * In addition, the ObjectDto provides some static helper functions to
 * do things like normalize IDs or resolve link references to objects.
 */
@ApiExtraModels(Link)
export class BaseObjectDto extends ActivityStreams.object('Object') {
  @ApiHideProperty()
  @Prop({
    name: '@context',
    type: mongoose.Schema.Types.Mixed,
    required: false
  })
  @Expose()
  public '@context': string | string[] = 'https://www.w3.org/ns/activitystreams';

  @ApiProperty({ required: true, type: 'string' })
  @Prop({ type: String, required: true })
  @Expose()
  public id!: string;

  /**
   * @todo for validation, the first type should be a string of any supported type
   */
  @ApiProperty({ type: 'string', required: true })
  @Prop({ type: Mixed, required: true })
  @Expose()
  public type!: string | string[];

  @ApiProperty({ type: String })
  @Prop({ type: Mixed })
  @Expose()
  public context?: string | string[];

  @ApiProperty({
    required: false,
    type: 'string',
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }]
  })
  @Prop({ type: String })
  @Expose()
  public name?: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  @Expose()
  public published?: string;

  @Prop({ type: String })
  @Expose()
  public updated?: string;

  @ApiProperty(ApiPropertyOneOfStringOrArray)
  @Prop({ type: Mixed })
  @Expose()
  public audience?: string | string[];

  /**
   * @todo This belongs in a separate Actor model
   */
  @Prop({ type: Mixed })
  @Expose()
  public publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };
}
