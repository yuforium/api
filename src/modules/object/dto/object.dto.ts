import { Prop } from '@nestjs/mongoose';
import { ApiExtraModels, ApiHideProperty, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import {
  ActivityStreams,
  ASObjectOrLink,
  Collection,
  Link
} from '@yuforium/activity-streams';
import { Expose, Transform } from 'class-transformer';
import * as mongoose from 'mongoose';
import sanitizeHtml from 'sanitize-html';
import { ObjectType } from '../type/object.type';
import { BaseObjectDto } from './base-object.dto';

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
export class ObjectDto extends BaseObjectDto {
  @ApiProperty({
    oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Link) }, {$ref: getSchemaPath(ObjectDto) }]
  })
  @Prop({ type: Mixed })
  @Expose()
  public attributedTo?: ASObjectOrLink | ASObjectOrLink[];

  @ApiProperty({
    type: String,
    required: true,
    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
    format: 'uri'
  })
  @Prop({ type: String })
  @Expose()
  /**
   * @todo Sanitize HTML on the way out.  We should always preserve HTML as it was received in an activity which is we don't sanitize it before
   * storing it in the database.  However, when we return it to the client, we should sanitize it to prevent XSS attacks.
   * Note that this should be improved by adding a cached field at the database level to store the sanitized version of the content.
   * Also note that we _will_ sanitize HTML when a user posts it to their outbox.
   */
  @Transform(({value}) => {
    return sanitizeHtml(value);
  }, { toClassOnly: true })
  public content?: string;

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
}
