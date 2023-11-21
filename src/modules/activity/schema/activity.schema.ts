import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Exclude } from "class-transformer";
import * as mongoose from "mongoose";
import { ActivityDto } from "../../../modules/activity/dto/activity.dto";

export type ActivityDocument = ActivityRecordDto & mongoose.Document;

@Schema({collection: 'activities'})
export class ActivityRecordDto extends ActivityDto {
  @Exclude()
  public _id?: string;

  @Exclude()
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'objects'})
  _object?: mongoose.Schema.Types.ObjectId;

  @Exclude()
  @Prop({type: String, required: true})
  _domain!: string;

  @Exclude()
  @Prop({type: Boolean, default: false})
  _local!: boolean;
}

export const ActivitySchema = SchemaFactory.createForClass(ActivityRecordDto);