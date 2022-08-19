import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams } from "@yuforium/activity-streams-validator";
import * as mongoose from "mongoose";

export type ActivityDocument = Activity & mongoose.Document;

const { Mixed } = mongoose.Schema.Types;

@Schema({ collection: 'activities' })
export class Activity extends PartialType(
  PickType(ActivityStreams.Activity, ['id', 'actor', 'object', 'type'])
) {
  @Prop({type: String})
  id: string | undefined;

  @Prop({type: String})
  actor: string | undefined;

  @Prop({type: Mixed})
  object: any;

  @Prop({type: String})
  type: string | undefined;

  // @Prop({type: Mixed})
  // actor?: any;

  // @Prop({type: Mixed})
  // target?: any;

  // @Prop({type: Mixed})
  // result?: any;

  // @Prop({type: Mixed})
  // origin?: any;

  // @Prop({type: Mixed})
  // instrument?: any;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);