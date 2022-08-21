import { PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams } from "@yuforium/activity-streams-validator";
import { Expose, Type } from "class-transformer";

export class ActivityDto extends PartialType(
  PickType(ActivityStreams.Activity, ['id', 'type', 'actor', 'object'])
) {
  @Expose()
  public id!: string;

  @Expose()
  public type!: string;

  @Expose()
  public actor!: string;

  @Expose()
  public object!: ActivityStreams.StreamObject;

  @Expose()
  public target!: string;

  @Expose()
  public published!: string;
}