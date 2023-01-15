import { Prop } from "@nestjs/mongoose";
import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams, ASObject, Collection, IsRequired } from "@yuforium/activity-streams";
import { Expose, Transform } from "class-transformer";
import { validateHeaderValue } from "http";
import * as mongoose from "mongoose";
import { sslToPlain } from "../util/ssl-to-plain";

const { Mixed } = mongoose.Schema.Types;

/**
 * Default Object DTO, which extends the ActivityStreams Object type and adds decorators for Mongoose and any custom validation overrides.
 */
export class ObjectDto extends ActivityStreams.object('Object') {
  @Prop({type: mongoose.Schema.Types.Mixed, required: true})
  @Expose()
  public '@context'?: string | string[] = 'https://www.w3.org/ns/activitystreams';

  @Transform(sslToPlain, {groups: ['sslToPlain']})
  @Prop({type: String, required: true})
  @Expose()
  public id!: string;

  @Prop({type: String, required: true})
  @Expose()
  public type!: string;

  @Prop({type: String})
  @Expose()
  public attributedTo?: string;

  @Prop({type: String})
  @Expose()
  public content?: string;

  @Prop({type: String})
  @Expose()
  public context?: string;

  @Prop({type: String})
  @Expose()
  public name?: string;

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

  @Prop({type: Mixed})
  @Expose()
  public to?: string | string[];

  @Prop({type: Mixed})
  @Expose()
  public publicKey?: {
    id: string;
    owner: string;
    publicKeyPem: string;
  }
}