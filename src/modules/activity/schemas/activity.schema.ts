import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from 'mongoose';

export type ActivityDocument = Activity & mongoose.Document;

@Schema({collection: 'stream-activity'})
export class Activity {
  @Prop({required: true})
  id: string;

  @Prop({required: true})
  type: string;

  @Prop({required: true, type: mongoose.Schema.Types.Mixed})
  object: any;

  @Prop({type: mongoose.Schema.Types.Mixed})
  actor?: any;

  @Prop({type: mongoose.Schema.Types})
  target?: any;

  @Prop({type: mongoose.Schema.Types})
  result?: any;

  @Prop({type: mongoose.Schema.Types})
  origin?: any;

  @Prop({type: mongoose.Schema.Types})
  instrument?: any;

  @Prop({type: mongoose.Schema.Types})
  attachment?: any;

  @Prop({type: mongoose.Schema.Types})
  attributedTo?: any;

  @Prop({type: mongoose.Schema.Types})
  audience?: any;

  @Prop({type: mongoose.Schema.Types})
  content?: any;

  @Prop({type: mongoose.Schema.Types})
  context?: any;

  @Prop({type: mongoose.Schema.Types})
  contentMap?: any;

  @Prop({type: mongoose.Schema.Types})
  endTime?: any;

  @Prop({type: mongoose.Schema.Types})
  generator?: any;

  @Prop({type: mongoose.Schema.Types})
  icon?: any;

  @Prop({type: mongoose.Schema.Types})
  image?: any;

  @Prop({type: mongoose.Schema.Types})
  inReplyTo?: any;

  @Prop({type: mongoose.Schema.Types})
  location?: any;

  @Prop({type: mongoose.Schema.Types})
  preview?: any;

  @Prop({type: mongoose.Schema.Types})
  published?: any;

  @Prop({type: mongoose.Schema.Types})
  replies?: any;

  @Prop({type: mongoose.Schema.Types})
  startTime?: any;

  @Prop({type: mongoose.Schema.Types})
  summary?: any;

  @Prop({type: mongoose.Schema.Types})
  summaryMap?: any;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);