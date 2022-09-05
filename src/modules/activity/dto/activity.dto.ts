import { Prop } from "@nestjs/mongoose";
import { PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams } from "@yuforium/activity-streams-validator";
import { Expose } from "class-transformer";
import * as mongoose from "mongoose";

const { Mixed } = mongoose.Schema.Types;

export class ActivityDto extends PartialType(
  PickType(ActivityStreams.Activity, ['id', 'type', 'actor', 'object'])
) {
  @Prop({type: String})
  @Expose()
  public id!: string;

  @Prop({type: String})
  @Expose()
  public type!: string;

  @Prop({type: String})
  @Expose()
  public actor!: string;

  @Prop({type: Mixed})
  @Expose()
  public object!: ActivityStreams.StreamObject;

  @Prop({type: String})
  @Expose()
  public target!: string;

  @Prop({type: String})
  @Expose()
  public published!: string;
}