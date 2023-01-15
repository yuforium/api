import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { ActivityDto } from "src/modules/activity/dto/activity.dto";

export type ActivityDocument = ActivityRecordDto & mongoose.Document;

@Schema({collection: 'activities'})
export class ActivityRecordDto extends ActivityDto {
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'objects'})
  _object?: mongoose.Schema.Types.ObjectId;

  @Prop({type: String, required: false})
  _serviceId?: string;

  @Prop({type: String, required: false})
  _path?: string
}

export const ActivitySchema = SchemaFactory.createForClass(ActivityRecordDto);