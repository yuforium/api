import { Prop } from '@nestjs/mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  ActivityStreams,
  ASObjectOrLink,
  Collection
} from '@yuforium/activity-streams';
import { Expose } from 'class-transformer';
import * as mongoose from 'mongoose';
import { ObjectType } from 'src/modules/object/type/object.type';

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
export class ObjectDto extends ActivityStreams.object('Object') implements ObjectType {
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
  public type!: string;

  @ApiProperty({ type: String })
  @Prop({ type: Mixed })
  @Expose()
  public attributedTo!: ASObjectOrLink | ASObjectOrLink[];

  @ApiProperty({
    type: String,
    required: true,
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    format: 'uri'
  })
  @Prop({ type: String })
  @Expose()
  public content?: string;

  @ApiProperty({ type: String })
  @Prop({ type: String })
  @Expose()
  public context?: string;

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

  @Prop({ type: Mixed })
  @Expose()
  public replies?: Collection;

  @Prop({ type: String })
  @Expose()
  public inReplyTo?: string;

  @Prop({ type: String })
  @Expose()
  public updated?: string;

  @ApiProperty(ApiPropertyOneOfStringOrArray)
  @Prop({ type: Mixed })
  @Expose()
  public to?: string | string[]; // note that the "to" field should always have a value, even if the spec says it's optional

  @ApiProperty(ApiPropertyOneOfStringOrArray)
  @Prop({ type: Mixed })
  @Expose()
  public cc?: string | string[];

  @ApiProperty(ApiPropertyOneOfStringOrArray)
  @Prop({ type: Mixed })
  @Expose()
  public bcc?: string | string[];

  @Prop({ type: Mixed })
  @Expose()
  public publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  };

  /**
   * Take a single ASObjectOrLink or an array of ASObjectOrLink and return ids
   * as an array of string values.
   * @todo This should throw an exception if there is no id value for any item
   * @param value
   * @returns Normalized array of string ids
   */
  public static normalizeIds(
    value: ASObjectOrLink | ASObjectOrLink[]
  ): string[] {
    if (Array.isArray(value)) {
      return value
        .filter((item: ASObjectOrLink) => {
          return typeof item === 'string' || item.id;
        })
        .map((item: ASObjectOrLink) => {
          if (typeof item === 'string') {
            return item;
          }
          return item.id;
        }) as string[];
    }
    return [value as string];
  }
}
