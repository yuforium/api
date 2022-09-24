import { Prop } from "@nestjs/mongoose";
import { OmitType, PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams, Collection, IsRequired } from "@yuforium/activity-streams-validator";
import { Expose } from "class-transformer";
import * as mongoose from "mongoose";

const { Mixed } = mongoose.Schema.Types;

export class ObjectDto extends PartialType(
  PickType(ActivityStreams.StreamObject, [
    'id',
    'type',
    'attributedTo',
    'content',
    'context',
    'name',
    'published',
    'replies',
    'inReplyTo',
    'updated',
    'to'
  ])) {
  @Prop({type: String, required: true})
  @Expose()
  public id?: string;

  @Prop({type: String, required: true})
  @Expose()
  public type!: string | string[];

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
}