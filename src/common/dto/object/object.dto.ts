import { Prop } from "@nestjs/mongoose";
import { ApiHideProperty, ApiProperty, OmitType, PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams, ASObject, ASObjectOrLink, Collection, IsRequired } from "@yuforium/activity-streams";
import { Exclude, Expose, Transform } from "class-transformer";
import { validateHeaderValue } from "http";
import * as mongoose from "mongoose";
import { sslToPlain } from "../util/ssl-to-plain";

const { Mixed } = mongoose.Schema.Types;

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
export class ObjectDto extends ActivityStreams.object('Object') {
  @ApiHideProperty()
  @Prop({name: '@context', type: mongoose.Schema.Types.Mixed, required: true})
  @Expose()
  public '@context'?: string | string[] = 'https://www.w3.org/ns/activitystreams';

  @ApiProperty({type: String})
  @Transform(sslToPlain, {groups: ['sslToPlain']})
  @Prop({type: String, required: true})
  @Expose()
  public id!: string;

  @ApiProperty({type: 'string', required: true})
  @Prop({type: String, required: true})
  @Expose()
  public type!: string;

  @ApiProperty({type: String})
  @Prop({type: Mixed})
  @Expose()
  public attributedTo?: string;

  @ApiProperty({
    required: true, 
    oneOf: [
      {type: 'string'},
      {type: 'array', items: {type: 'string'}}], 
    format: 'uri'
  })
  @Prop({type: String})
  @Expose()
  public content?: string;

  @ApiProperty({type: String})
  @Prop({type: String})
  @Expose()
  public context?: string;

  @ApiProperty({
    required: false,
    type: 'string',
    oneOf: [
      {type: 'string'},
      {type: 'array', items: {type: 'string'}}
    ]
  })
  @Prop({type: String})
  @Expose()
  public name?: string;

  @ApiProperty({type: String})
  @Prop({type: String})
  @Expose()
  public published?: string;

  @Prop({type: Mixed})
  @Expose()
  public replies?: Collection;

  @Prop({type: String})
  @Expose()
  public inReplyTo?: string;

  @Prop({type: String})
  @Expose()
  public updated?: string;

  @ApiProperty({
    required: false,
    oneOf: [
      {type: 'string'},
      {type: 'array', items: {type: 'string'}}
    ]
  })
  @Prop({type: Mixed})
  @Expose()
  @IsRequired()
  public to!: string | string[]; // note that the "to" field should always have a value, even if the spec says it's optional

  @Prop({type: Mixed})
  @Expose()
  public publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  }

  /**
   * Take a single ASObjectOrLink or an array of ASObjectOrLink and return ids
   * as an array of string values.
   * @todo This should throw an exception if there is no id value for any item
   * @param value 
   * @returns Normalized array of string ids
   */
  public static normalizeIds(value: ASObjectOrLink | ASObjectOrLink[]): string[] {
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