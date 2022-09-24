import { Prop } from "@nestjs/mongoose";
import { PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams } from "@yuforium/activity-streams-validator";
import { Expose } from "class-transformer";
import * as mongoose from "mongoose";
import { ObjectDto } from "src/modules/object/dto/object.dto";

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
  // public object!: ActivityStreams.StreamObject;
  public object!: ObjectDto;

  @Prop({type: String})
  @Expose()
  public target!: string;

  @Prop({type: String})
  @Expose()
  public published!: string;
}