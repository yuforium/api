import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type ActivityDocument = Activity & Document;

@Schema({collection: 'activities'})
export class Activity {
  @Prop({required: true})
  id: string;

  @Prop({required: true})
  type: string;

  @Prop()
  actor?: any;

  @Prop()
  target?: any;

  @Prop()
  result?: any;

  @Prop()
  origin?: any;

  @Prop()
  instrument?: any;

  @Prop()
  attachment?: any;

  @Prop()
  attributedTo?: any;

  @Prop()
  audience?: any;

  @Prop()
  content?: any;

  @Prop()
  context?: any;

  @Prop()
  contentMap?: any;

  @Prop()
  endTime?: any;

  @Prop()
  generator?: any;

  @Prop()
  icon?: any;

  @Prop()
  image?: any;

  @Prop()
  inReplyTo?: any;

  @Prop()
  location?: any;

  @Prop()
  preview?: any;

  @Prop()
  published?: any;

  @Prop()
  replies?: any;

  @Prop()
  startTime?: any;

  @Prop()
  summary?: any;

  @Prop()
  summaryMap?: any;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);