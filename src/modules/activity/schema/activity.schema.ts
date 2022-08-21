import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams } from "@yuforium/activity-streams-validator";
// import { Schema } from "inspector";
import * as mongoose from "mongoose";

export type ActivityDocument = ActivityRecord & mongoose.Document;

const { Mixed } = mongoose.Schema.Types;

@Schema({ collection: 'activities' })
export class ActivityRecord extends PartialType(
  PickType(ActivityStreams.Activity, ['id', 'actor', 'object', 'type'])
) {
  @Prop({type: String})
  id!: string;

  @Prop({type: String})
  actor!: string;

  @Prop({type: Mixed})
  object!: ActivityStreams.StreamObject;

  @Prop({type: String})
  type!: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'objects'})
  _object?: mongoose.Schema.Types.ObjectId;

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

export const ActivitySchema = SchemaFactory.createForClass(ActivityRecord);